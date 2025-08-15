// /js/post-update.js
// 수정 페이지 전용 스크립트
// - 비로그인 접근 → 로그인으로 안내(redirect 유지)
// - 로드 시 소유자 확인 가능하면 내 글이 아닐 때 즉시 되돌림(상세로)
// - 저장(PUT) 시 상태코드별 친화적 안내

(() => {
    const { apiFetch: callApi, getToken } = window.API || {};

    // ===== JWT 유틸 =====
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
        const token = getToken?.();
        const payload = decodeJwtPayload(token);
        if (!payload) return null;
        return payload.sub || payload.loginId || payload.userId || payload.username || null;
    }
    function getId() {
        const m = location.pathname.match(/\/posts\/(\d+)\/edit/);
        return m ? m[1] : null;
    }
    function getOwnerLoginIdFromPost(data) {
        if (data?.student?.loginId) return data.student.loginId;
        if (data?.student?.userId)  return data.student.userId;
        return (
            data.ownerLoginId ||
            data.studentLoginId ||
            data.authorLoginId ||
            data.userLoginId ||
            data.userId ||
            null
        );
    }

    // ===== 진입 가드: 비로그인 → 로그인으로 =====
    const id = getId();
    if (!getToken?.()) {
        alert('로그인이 필요한 기능입니다.\n로그인 페이지로 이동합니다.');
        location.replace(`/sign-in?redirect=${encodeURIComponent(`/posts/${id}/edit`)}`);
        return;
    }

    const form = document.getElementById('form');
    const btn  = document.getElementById('btn-submit');
    const cancel = document.getElementById('btn-cancel');

    if (cancel) {
        cancel.addEventListener('click', (e) => {
            e.preventDefault();
            location.href = `/posts/${id}`;
        });
    }

    // ===== 초기 데이터 로드(+ 소유자 체크) =====
    (async function load() {
        const resp = await callApi(`/posts/${id}`);
        if (!resp.ok) {
            const t = await resp.text().catch(() => '');
            alert(t || '게시글 조회 실패');
            location.replace(`/posts/${id}`);
            return;
        }
        const data = await resp.json();

        // 소유자 판단 가능하면 내 글이 아니면 즉시 차단
        const current = getCurrentLoginId();
        const owner   = getOwnerLoginIdFromPost(data);
        if (current && owner && current !== owner) {
            alert('본인이 작성한 글만 수정할 수 있습니다.');
            location.replace(`/posts/${id}`);
            return;
        }

        // 폼 채우기
        form.title.value = data.title ?? '';
        form.content.value = data.content ?? data.description ?? '';
    })();

    // ===== 저장 =====
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!getToken?.()) {
            alert('세션이 만료되었습니다.\n다시 로그인해 주세요.');
            location.replace(`/sign-in?redirect=${encodeURIComponent(`/posts/${id}/edit`)}`);
            return;
        }

        const title = form.title.value.trim();
        const content = form.content.value.trim();
        if (!title || !content) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }

        btn.disabled = true;
        try {
            const resp = await callApi(`/posts/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ title, content })
            });

            // 상태코드별 안내
            if (resp.status === 401) { alert('로그인이 필요합니다.'); location.href = '/sign-in'; return; }
            if (resp.status === 403) { alert('본인이 작성한 글만 수정할 수 있습니다.'); return; }
            if (resp.status === 404) { alert('존재하지 않는 게시글입니다.'); location.replace('/posts'); return; }
            if (resp.status >= 500){ alert('다른 사용자의 글은 수정할 수 없습니다.'); return; } // ← 변경
            if (!resp.ok) {
                const t = await resp.text().catch(() => '');
                throw new Error(t || '수정 실패');
            }

            alert('수정되었습니다.');
            location.replace(`/posts/${id}`);
        } catch (err) {
            alert(err.message || '수정 실패');
        } finally {
            btn.disabled = false;
        }
    });
})();
