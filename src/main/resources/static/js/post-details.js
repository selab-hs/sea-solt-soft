// /js/post-details.js
// 상세 페이지 전용 스크립트
// - 삭제 시 상태코드별 친화적 안내
// - "내 글만" 수정/삭제 허용(가능하면 버튼 자체도 숨김)
// - 소유자를 확실히 알 수 없으면 UI는 보이되 서버 응답으로 차단

(() => {
    const { apiFetch: callApi, getToken } = window.API || {};

    // ===== 요소 =====
    const $title     = document.getElementById('title');
    const $writer    = document.getElementById('writer');
    const $createdAt = document.getElementById('createdAt');
    const $content   = document.getElementById('content');
    const $btnEdit   = document.getElementById('btn-edit');
    const $btnDel    = document.getElementById('btn-del');

    // ===== 유틸 =====
    function escapeHtml(v) {
        return String(v ?? '').replace(/[&<>"']/g, c => ({
            '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
        })[c]);
    }
    function parseApiDate(v) {
        if (v == null) return null;
        if (typeof v === 'number') return new Date(v);
        if (typeof v !== 'string') return null;
        if (/[zZ]|[+\-]\d{2}:\d{2}$/.test(v)) return new Date(v);
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v)) return new Date(v + 'Z');
        return new Date(v);
    }
    function formatDateTime(v) {
        const d = parseApiDate(v);
        if (!d || Number.isNaN(d.getTime())) return v ?? '';
        return d.toLocaleString();
    }
    function getId() {
        const m = location.pathname.match(/\/posts\/(\d+)/);
        return m ? m[1] : null;
    }

    // JWT → 현재 사용자 loginId(= sub)
    function decodeJwtPayload(token) {
        if (!token) return null;
        const parts = token.split('.');
        if (parts.length < 2) return null;
        try {
            const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const json = decodeURIComponent(escape(atob(b64)));
            return JSON.parse(json);
        } catch {
            try { return JSON.parse(atob(parts[1])); } catch { return null; }
        }
    }
    function getCurrentLoginId() {
        const token = typeof getToken === 'function' ? getToken() : null;
        const payload = decodeJwtPayload(token);
        if (!payload) return null;
        return payload.sub || payload.loginId || payload.userId || payload.username || null;
    }

    // 상세 응답에서 글 소유자 loginId 후보 추출 (여러 스키마 호환)
    function getOwnerLoginIdFromPost(data) {
        if (data?.student?.loginId) return data.student.loginId;     // 권장
        if (data?.student?.userId)  return data.student.userId;      // 대체
        return (
            data.ownerLoginId ||
            data.studentLoginId ||
            data.authorLoginId ||
            data.userLoginId ||
            data.userId ||                                           // 평면 키
            null
        );
    }

    // 소유자 판별 결과
    let ownerLoginId = null;
    let currentLoginId = null;
    let canEditOrDelete = true; // 기본: 모르면 UI 보이고 서버가 막게

    function applyOwnerGuard(postData) {
        currentLoginId = getCurrentLoginId();
        ownerLoginId   = getOwnerLoginIdFromPost(postData);

        // 두 값이 모두 있을 때만 엄격 비교해서 숨김
        if (currentLoginId && ownerLoginId) {
            canEditOrDelete = (currentLoginId === ownerLoginId);
            if (!canEditOrDelete) {
                $btnEdit?.classList.add('hidden'); // CSS: .hidden { display:none !important; }
                $btnDel?.classList.add('hidden');
            }
        } else {
            // 소유자 정보를 확정 못하면 UI는 보이게 두고 서버 응답으로 차단
            canEditOrDelete = true;
        }
    }

    // ===== 데이터 로드 & 렌더 =====
    async function load() {
        const id = getId();
        if (!id) return;

        const resp = await callApi(`/posts/${encodeURIComponent(id)}`);
        if (!resp.ok) {
            const t = await resp.text().catch(()=> '');
            alert(t || '상세 조회 실패');
            return;
        }
        const data = await resp.json();

        const title   = data.title ?? '(제목)';
        const created = formatDateTime(data.createdAt ?? data.updatedAt ?? '');
        const body    = (data.content ?? data.description ?? '').toString();

        const writerRaw = data.authorName ?? data.username ?? data.studentName ?? data.student?.name ?? '';
        const writer    = (writerRaw ?? '').toString().trim() || '-';

        $title && ($title.textContent = title);
        $writer && ($writer.textContent = writer);
        $createdAt && ($createdAt.textContent = created || '-');
        $content && ($content.innerHTML = `<pre>${escapeHtml(body)}</pre>`);

        applyOwnerGuard(data);
    }

    // ===== 버튼 이벤트 =====
    if ($btnEdit) $btnEdit.addEventListener('click', (e) => {
        const id = getId(); if (!id) return;

        // 1) 비로그인 → 로그인으로 (새 패턴으로 redirect 유지)
        if (!getToken?.()) {
            e.preventDefault();
            alert('로그인이 필요한 기능입니다.\n로그인 페이지로 이동합니다.');
            location.href = `/sign-in?redirect=${encodeURIComponent(`/posts/edit/${id}`)}`;
            return;
        }

        // 2) 소유자를 확실히 알 수 있고, 내가 아니면 이동 차단
        if (currentLoginId && ownerLoginId && currentLoginId !== ownerLoginId) {
            e.preventDefault();
            alert('본인이 작성한 글만 수정할 수 있습니다.');
            return;
        }

        // 3) 수정 페이지로 이동 (새 패턴)
        location.href = `/posts/edit/${id}`;
    });

    if ($btnDel) $btnDel.addEventListener('click', async (e) => {
        const id = getId(); if (!id) return;

        // 비로그인 → 상세로 돌아오도록 유지(기존 동작)
        if (!getToken?.()) {
            e.preventDefault();
            alert('로그인이 필요한 기능입니다.\n로그인 페이지로 이동합니다.');
            location.href = `/sign-in?redirect=${encodeURIComponent(`/posts/${id}`)}`;
            return;
        }

        // 소유자 확정 + 내가 아니면 즉시 차단
        if (currentLoginId && ownerLoginId && currentLoginId !== ownerLoginId) {
            e.preventDefault();
            alert('본인이 작성한 글만 삭제할 수 있습니다.');
            return;
        }

        if (!confirm('정말 삭제하시겠습니까?')) return;

        const resp = await callApi(`/posts/${encodeURIComponent(id)}`, { method: 'DELETE' });

        // 상태코드별 친화적 메시지
        if (resp.status === 401) { alert('로그인이 필요합니다.'); location.href = '/sign-in'; return; }
        if (resp.status === 403) { alert('본인이 작성한 글만 삭제할 수 있습니다.'); return; }
        if (resp.status === 404) { alert('이미 삭제되었거나 존재하지 않는 게시글입니다.'); return; }
        if (!resp.ok)          { alert('삭제에 실패했습니다.'); return; }

        alert('삭제되었습니다.');
        location.href = '/posts';
    });

    load();
})();
