(() => {
    const { apiFetch: callApi } = window.API;

    const $title = document.getElementById('post-title');
    const $meta  = document.getElementById('post-meta');
    const $body  = document.getElementById('post-body');
    const $btnEdit = document.getElementById('btn-edit');
    const $btnDel  = document.getElementById('btn-del');
    const $btnBack = document.getElementById('btn-back');

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
    function getId() {
        const m = location.pathname.match(/\/posts\/(\d+)/);
        return m ? m[1] : null;
    }

    async function load() {
        const id = getId();
        if (!id) return;

        const resp = await callApi(`/posts/${encodeURIComponent(id)}`);
        if (!resp.ok) {
            const t = await resp.text().catch(()=>'');
            alert(t || '상세 조회 실패');
            return;
        }
        const data = await resp.json();

        // 필드명 후보들까지 커버
        const title = data.title ?? data.subject ?? '(제목)';
        const writer = (data.authorName ?? '').trim() || '-';
        const createdAt = formatDateTime(data.createdAt ?? data.createdDate ?? data.updatedAt);
        const content = data.content ?? data.description ?? data.body ?? '';

        if ($title) $title.textContent = title;
        if ($meta)  $meta.textContent  = `작성자: ${writer} · 작성일: ${createdAt || '-'}`;
        if ($body)  $body.innerHTML     = `<pre>${escapeHtml(content)}</pre>`;
    }

    if ($btnBack) $btnBack.addEventListener('click', () => history.back());
    if ($btnEdit) $btnEdit.addEventListener('click', () => {
        const id = getId(); if (id) location.href = `/posts/${id}/edit`;
    });
    if ($btnDel) $btnDel.addEventListener('click', async () => {
        const id = getId(); if (!id) return;
        if (!confirm('정말 삭제하시겠습니까?')) return;
        const resp = await callApi(`/posts/${encodeURIComponent(id)}`, { method: 'DELETE' });
        if (!resp.ok) { alert(await resp.text().catch(()=> '삭제 실패')); return; }
        alert('삭제되었습니다.'); location.href = '/posts';
    });

    load();
})();
