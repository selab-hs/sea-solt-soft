// 글 작성 페이지 스크립트
// - 진입 시 로그인/만료 검사 → 로그인으로 이동(redirect=/posts/new)
// - 제출 직전에도 토큰 재검사(세션 만료 대비)
// - 401/403/기타 에러 메시지 친화화

(() => {
    const { apiFetch: callApi, isLoggedIn } = window.API || {};

    // 진입 가드
    if (!isLoggedIn?.()) {
        alert('로그인이 필요한 기능입니다.\n로그인 페이지로 이동합니다.');
        location.replace(`/sign-in?redirect=${encodeURIComponent('/posts/new')}`);
        return;
    }

    const form = document.getElementById('form');
    const btn  = document.getElementById('btn-submit');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 제출 직전 재확인(세션 만료 대비)
        if (!isLoggedIn?.()) {
            alert('세션이 만료되었습니다.\n다시 로그인해 주세요.');
            location.replace(`/sign-in?redirect=${encodeURIComponent('/posts/new')}`);
            return;
        }

        const title = form.title.value.trim();
        const content = form.content.value.trim();
        const description = (form.description?.value ?? '').trim();

        if (!title || !content) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }

        btn.disabled = true;
        try {
            const resp = await callApi(`/posts`, {
                method: 'POST',
                body: JSON.stringify({
                    title,
                    content,
                    description: description || null
                })
            });

            if (resp.status === 401) { // apiClient가 이미 리다이렉트하지만, 이중 안전망
                alert('로그인이 필요한 기능입니다.');
                return;
            }
            if (resp.status === 403) {
                alert('작성 권한이 없습니다.\n다른 계정으로 로그인해 주세요.');
                return;
            }
            if (!resp.ok) {
                const t = await resp.text().catch(() => '');
                throw new Error(t || '등록 실패');
            }

            let id = null;
            try { id = (await resp.json())?.id ?? null; } catch {}

            alert('등록되었습니다.');
            location.replace(id ? `/posts/${id}` : `/posts`);
        } catch (err) {
            alert(err.message || '등록 실패');
        } finally {
            btn.disabled = false;
        }
    });
})();
