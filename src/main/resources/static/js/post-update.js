// 전역 API 사용 (apiClient-1.0.js가 먼저 로드되어 있어야 함)
const { apiFetch: callApi } = window.API;

// id 읽기: (1) 템플릿에서 window.POST_ID 주입 or (2) 쿼리스트링 ?id=123
const qs = new URLSearchParams(location.search);
const id = (window.POST_ID ?? qs.get('id'));
if (!id) {
    alert('잘못된 접근입니다.');
    location.replace('/posts');
}

const form = document.getElementById('form');
const btn = document.getElementById('btn-submit');
const cancel = document.getElementById('btn-cancel');

// 취소 버튼을 상세로 보낼 수 있게(상세 라우트가 없으면 목록으로 유지)
cancel.addEventListener('click', (e) => {
    // 상세 라우트가 준비됐다면 다음 줄로 교체:
    // e.preventDefault(); location.href = `/posts/${id}`;
});

// 초기 데이터 로드
(async function load() {
    const resp = await apiFetch(`/posts/${id}`);
    if (!resp.ok) {
        const t = await resp.text().catch(() => '');
        alert(t || '게시글 조회 실패');
        return;
    }
    const data = await resp.json();
    form.title.value = data.title ?? '';
    form.content.value = data.content ?? '';
})();

// 저장
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = form.title.value.trim();
    const content = form.content.value.trim();
    if (!title || !content) {
        alert('제목과 내용을 모두 입력해주세요.');
        return;
    }

    btn.disabled = true;
    try {
        const resp = await apiFetch(`/posts/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ title, content })
        });

        if (!resp.ok) {
            const t = await resp.text().catch(() => '');
            throw new Error(t || '수정 실패');
        }

        alert('수정되었습니다.');
        // 상세 라우트가 있으면 상세로, 없으면 목록으로
        // location.replace(`/posts/${id}`);
        location.replace(`/posts`);
    } catch (err) {
        alert(err.message || '수정 실패');
    } finally {
        btn.disabled = false;
    }
});
