// 전역 API 사용 (apiClient-1.0.js가 먼저 로드되어 있어야 함)

const form = document.getElementById('form');
const btn = document.getElementById('btn-submit');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = form.title.value.trim();
    const content = form.content.value.trim();

    // 1차 방어: 빈칸이면 전송 안 함
    if (!title || !content) {
        alert('제목과 내용을 모두 입력해주세요.');
        return;
    }

    btn.disabled = true;
    try {
        const resp = await apiFetch(`/posts`, {
            method: 'POST',
            body: JSON.stringify({ title, content })
        });

        if (!resp.ok) {
            const t = await resp.text().catch(() => '');
            throw new Error(t || '등록 실패');
        }

        // PostResponse를 받으면 id로 상세로 보낼 수도 있음 (지금은 목록으로)
        let id = null;
        try {
            const data = await resp.json();
            id = data?.id ?? null;
        } catch {/* 응답 바디가 없을 수도 있음 */}

        alert('등록되었습니다.');
        // 상세 라우트(/posts/{id})를 나중에 열면 아래로 교체 가능:
        // if (id) location.replace(`/posts/${id}`); else location.replace(`/posts`);
        location.replace(`/posts`);
    } catch (err) {
        alert(err.message || '등록 실패');
    } finally {
        btn.disabled = false;
    }
});
