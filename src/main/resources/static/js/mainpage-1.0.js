// /js/mainpage-1.0.js
// - 네비 렌더링/토글 로직 동일
// - 토큰은 Authorization 키만 사용

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('menuToggle');
  const nav       = document.getElementById('mainNav');
  const overlay   = document.getElementById('overlay');

  function getTokenSafe() {
    try { return window.API?.getToken?.() || null; }
    catch { return null; }
  }

  function isLoggedIn() {
    const token = getTokenSafe();
    return !!token;
  }

  function buildRedirectParam() {
    const redirect = location.pathname + location.search;
    try { return encodeURIComponent(redirect); }
    catch { return encodeURIComponent('/posts'); }
  }

  function renderNav() {
    if (!nav) return;

    const loggedIn = isLoggedIn();
    const redirect = buildRedirectParam();

    const items = [{ href: '/posts', label: '목록' }];

    if (!loggedIn) {
      items.push(
          { href: `/sign-in?redirect=${redirect}`, label: '로그인', id: 'nav-login' },
          { href: '/sign-up',                      label: '회원가입', id: 'nav-signup' },
      );
    } else {
      items.push({ href: '#', label: '로그아웃', id: 'nav-logout' });
    }

    nav.innerHTML = items
        .map(i => `<a ${i.id ? `id="${i.id}"` : ''} href="${i.href}">${i.label}</a>`)
        .join('');

    const $logout = document.getElementById('nav-logout');
    if ($logout) {
      $logout.addEventListener('click', (e) => {
        e.preventDefault();
        try { window.API?.clearToken?.(); } catch {}
        localStorage.removeItem('Authorization'); // ← key 통일
        location.href = '/sign-in';
      });
    }

    document.querySelectorAll('.main-nav a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
        overlay?.classList.remove('active');
      });
    });
  }

  renderNav();

  if (toggleBtn && nav && overlay) {
    toggleBtn.addEventListener('click', () => {
      nav.classList.toggle('active');
      overlay.classList.toggle('active');
    });
    overlay.addEventListener('click', () => {
      nav.classList.remove('active');
      overlay.classList.remove('active');
    });
  }
});
