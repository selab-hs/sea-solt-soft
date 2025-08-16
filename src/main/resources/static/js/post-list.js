// 게시글 목록 페이지 스크립트 (최신 글 페이지 자동 점프 + 로그인 가드 있는 '새 글 작성')
const { apiFetch: callApi } = window.API;

const PAGE_SIZE = 20;
let state = { page: 0, q: '' };

// 최초 진입 시 최신 글(마지막 페이지)로 자동 이동
let firstLoad = true;

// ===== JWT 유틸 (새 글 작성 버튼 가드에만 사용) =====
function getAccessToken() {
    return window.API?.getToken?.() ?? null; // ← Authorization 키만 사용
}
function decodeJwtPayload(tokenLike) {
    const token = tokenLike?.startsWith('Bearer ') ? tokenLike.slice(7) : tokenLike;
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

// ===== DOM =====
const tbody     = document.querySelector('#list tbody');
const emptyEl   = document.getElementById('empty');
const pageInfo  = document.getElementById('page-info');
const prevBtn   = document.getElementById('prev');
const nextBtn   = document.getElementById('next');
const searchForm= document.getElementById('search-form');
const qInput    = document.getElementById('q');
const resetBtn  = document.getElementById('btn-reset');
const newBtn    = document.getElementById('btn-new');

// 새 글 작성 (비로그인/만료 → 로그인으로 안내)
if (newBtn) {
    newBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const token   = getAccessToken();
        const payload = decodeJwtPayload(token);
        const notLoggedIn = !payload || (typeof payload.exp === 'number' && Date.now() >= payload.exp * 1000);

        if (notLoggedIn) {
            alert('로그인이 필요한 기능입니다.\n로그인 페이지로 이동합니다.');
            location.href = `/sign-in?redirect=${encodeURIComponent('/posts/new')}`;
            return;
        }
        location.href = '/posts/new';
    });
}

// 검색
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    state.q = qInput.value.trim();
    state.page = 0;
    firstLoad = true;
    load();
});

// 초기화
resetBtn.addEventListener('click', () => {
    qInput.value = '';
    state.q = '';
    state.page = 0;
    firstLoad = true;
    load();
});

// 페이징
prevBtn.addEventListener('click', () => {
    if (state.page > 0) { state.page--; firstLoad = false; load(); }
});
nextBtn.addEventListener('click', () => {
    state.page++; firstLoad = false; load();
});

// 렌더 (관리 열/버튼 없음)
function renderRows(items) {
    if (!items || items.length === 0) {
        tbody.innerHTML = '';
        emptyEl.style.display = 'block';
        return;
    }
    emptyEl.style.display = 'none';

    tbody.innerHTML = items.map(row => {
        const id     = row.id;
        const title  = row.title ?? '(제목 없음)';
        const writer = (row.authorName ?? row.username ?? row.studentName ?? '').toString().trim() || '-';
        const createdRaw = row.createdAt ?? row.updatedAt ?? row.createdDate ?? '';
        const createdAt  = formatDateTime(createdRaw);

        return `
      <tr>
        <td>${escapeHtml(id)}</td>
        <td>
          <a class="row-link" href="/posts/${encodeURIComponent(id)}">
            ${escapeHtml(title)}
          </a>
        </td>
        <td>${escapeHtml(writer)}</td>
        <td>${escapeHtml(createdAt)}</td>
      </tr>
    `;
    }).join('');
}

function renderPager(data) {
    const cur   = (data.number ?? state.page) + 1;
    const total = data.totalPages ?? 1;
    pageInfo.textContent = `페이지 ${cur} / ${total}`;
    prevBtn.disabled = data.first === true || (data.number ?? 0) <= 0;
    nextBtn.disabled = data.last === true || cur >= total;
}

// 데이터 로드
async function load() {
    const params = new URLSearchParams({ page: state.page, size: PAGE_SIZE });
    params.append('sort', 'id,desc');
    if (state.q) params.append('titleSearch', state.q);

    const resp = await callApi(`/posts?${params.toString()}`);
    if (!resp.ok) {
        const t = await resp.text().catch(() => '');
        console.error('[POST LIST] API 실패', resp.status, t);
        alert(t || '목록 조회 실패');
        return;
    }

    const data = await resp.json();

    if (firstLoad) {
        firstLoad = false;
        const last = Math.max(0, (data.totalPages ?? 1) - 1);
        if (state.page !== last) {
            state.page = last;
            return load();
        }
    }

    const rows = data.content || [];

    if (rows.length === 0 && (data.totalPages ?? 1) > 0 && state.page > 0) {
        state.page = Math.min(state.page, (data.totalPages ?? 1) - 1);
        return load();
    }

    renderRows(rows);
    renderPager(data);
}

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

// 시작
load();
