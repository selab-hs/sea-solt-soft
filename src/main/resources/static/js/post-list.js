// window.API 사용 (defer 로드 순서: apiClient → 이 파일)
const { apiFetch: callApi } = window.API;

const PAGE_SIZE = 20; // 요구사항: 한 번에 20개
let state = { page: 0, q: '' };

// 요소
const tbody = document.querySelector('#list tbody');
const emptyEl = document.getElementById('empty');
const pageInfo = document.getElementById('page-info');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const searchForm = document.getElementById('search-form');
const qInput = document.getElementById('q');
const resetBtn = document.getElementById('btn-reset');
const newBtn = document.getElementById('btn-new');

// 새 글 작성
if (newBtn) {
    newBtn.addEventListener('click', (e) => {
        e.preventDefault?.();
        location.href = '/posts/new';
    });
} else {
    console.warn('#btn-new not found');
}

// 검색
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    state.q = qInput.value.trim();
    state.page = 0;
    load();
});

// 초기화
resetBtn.addEventListener('click', () => {
    qInput.value = '';
    state.q = '';
    state.page = 0;
    load();
});

// 페이징
prevBtn.addEventListener('click', () => { if (state.page > 0) { state.page--; load(); } });
nextBtn.addEventListener('click', () => { state.page++; load(); });

// ===== 이벤트 위임(전역 함수 불필요) =====
document.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.btn-edit');
    if (editBtn) {
        const id = editBtn.dataset.id;
        // ✅ 이제 정적 html이 아니라 컨트롤러 경로로 이동
        location.href = `/posts/${encodeURIComponent(id)}`;
        return;
    }
    const delBtn = e.target.closest('.btn-del');
    if (delBtn) {
        const id = delBtn.dataset.id;
        onDelete(id);
    }
});

// 삭제 로직
async function onDelete(id) {
    if (!id) return;
    if (!confirm('정말 삭제하시겠습니까?')) return;

    const resp = await callApi(`/posts/${encodeURIComponent(id)}`, {
        method: 'DELETE'
    });
    if (!resp.ok) {
        const t = await resp.text().catch(() => '');
        alert(t || '삭제 실패');
        return;
    }
    // 현재 페이지 재조회
    load();
}

// 렌더
function renderRows(items) {
    if (!items || items.length === 0) {
        tbody.innerHTML = '';
        emptyEl.style.display = 'block';
        return;
    }
    emptyEl.style.display = 'none';

    tbody.innerHTML = items.map(row => {
        const id = row.id;
        const title = row.title ?? '(제목 없음)';

        // 작성자
        const writer = (row.authorName ?? '').toString().trim() || '-';


        // 날짜 필드 후보군
        const createdRaw = row.createdAt ?? row.updatedAt ?? row.createdDate ?? '';
        const createdAt = formatDateTime(createdRaw);

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
        <td>
          <button data-id="${id}" class="action btn-edit">수정</button>
          <button data-id="${id}" class="action btn-del">삭제</button>
        </td>
      </tr>
    `;
    }).join('');
}

function renderPager(data) {
    const cur = (data.number ?? state.page) + 1;
    const total = data.totalPages ?? 1;
    pageInfo.textContent = `페이지 ${cur} / ${total}`;
    prevBtn.disabled = data.first === true || (data.number ?? 0) <= 0;
    nextBtn.disabled = data.last === true || cur >= total;
}

// 데이터 로드
async function load() {
    const params = new URLSearchParams({ page: state.page, size: PAGE_SIZE });
    if (state.q) params.append('titleSearch', state.q);

    // ✅ callApi로 일관화
    const resp = await callApi(`/posts?${params.toString()}`);
    if (!resp.ok) {
        const t = await resp.text().catch(() => '');
        alert(t || '목록 조회 실패');
        return;
    }

    const data = await resp.json();
    const rows = data.content || [];

    // 마지막 페이지 보정
    if (rows.length === 0 && (data.totalPages ?? 1) > 0 && state.page > 0) {
        state.page = Math.min(state.page, (data.totalPages ?? 1) - 1);
        return load();
    }

    renderRows(rows);
    renderPager(data);
}

// 유틸
function escapeHtml(v) {
    return String(v ?? '').replace(/[&<>"']/g, c => ({
        '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
    })[c]);
}
function formatDateTime(v) {
    if (!v) return '';
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleString();
}

// 초기 로드
load();
