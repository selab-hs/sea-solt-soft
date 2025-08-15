// /js/mainpage-1.0.js  (교체본)
// - 햄버거/오버레이 토글은 기존 그대로
// - 로그인 상태 감지 후 네비게이션(목록/로그인/회원가입/로그아웃) 동적 주입
// - 로그아웃 시 accessToken 제거 후 /sign-in으로 이동
// - 모든 페이지(목록/상세/수정)에서 공통 적용

document.addEventListener('DOMContentLoaded', () => {
  // 요소 참조
  const toggleBtn = document.getElementById('menuToggle'); // 햄버거 버튼
  const nav       = document.getElementById('mainNav');    // 네비게이션 메뉴
  const overlay   = document.getElementById('overlay');    // 배경 오버레이

  // ===== 1) 로그인 상태 기반 네비 렌더링 =====
  function getTokenSafe() {
    try {
      // apiClient.js가 있으면 우선 사용, 없으면 localStorage 직접 조회
      return window.API?.getToken?.() || localStorage.getItem('accessToken');
    } catch {
      return localStorage.getItem('accessToken');
    }
  }

  function isLoggedIn() {
    const token = getTokenSafe();
    return !!token;
  }

  function buildRedirectParam() {
    // 로그인/회원가입 완료 후 돌아올 경로
    const redirect = location.pathname + location.search;
    try {
      return encodeURIComponent(redirect);
    } catch {
      return encodeURIComponent('/posts');
    }
  }

  function renderNav() {
    if (!nav) return;

    const loggedIn = isLoggedIn();
    const redirect = buildRedirectParam();

    // 공통 메뉴(항상 보임)
    const items = [
      { href: '/posts', label: '목록' },
    ];

    if (!loggedIn) {
      // 비로그인 시: 로그인/회원가입 노출
      items.push(
          { href: `/sign-in?redirect=${redirect}`, label: '로그인', id: 'nav-login' },
          { href: '/sign-up',                       label: '회원가입', id: 'nav-signup' },
      );
    } else {
      // 로그인 시: 회원가입 숨기고 로그아웃 노출
      items.push(
          { href: '#', label: '로그아웃', id: 'nav-logout' },
      );
    }

    // 실제 DOM 반영
    nav.innerHTML = items
        .map(i => `<a ${i.id ? `id="${i.id}"` : ''} href="${i.href}">${i.label}</a>`)
        .join('');

    // 로그아웃 클릭 핸들러
    const $logout = document.getElementById('nav-logout');
    if ($logout) {
      $logout.addEventListener('click', (e) => {
        e.preventDefault();
        try { window.API?.clearToken?.(); } catch {}
        localStorage.removeItem('accessToken');
        location.href = '/sign-in';
      });
    }

    // 메뉴 항목 클릭 시: 모바일 UX 위해 메뉴 닫기
    document.querySelectorAll('.main-nav a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
        overlay?.classList.remove('active');
      });
    });
  }

  renderNav();

  //  햄버거/오버레이 토글
  if (toggleBtn && nav && overlay) {
    // 햄버거 버튼 → 메뉴/오버레이 토글
    toggleBtn.addEventListener('click', () => {
      nav.classList.toggle('active');
      overlay.classList.toggle('active');
    });

    // 오버레이 클릭 → 메뉴 닫기
    overlay.addEventListener('click', () => {
      nav.classList.remove('active');
      overlay.classList.remove('active');
    });
  }
});
