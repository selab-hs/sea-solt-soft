document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');
  const overlay = document.getElementById('overlay');

  // 햄버거 버튼 클릭 → 메뉴 열기 + 배경 어두워짐
  toggleBtn.addEventListener('click', () => {
    nav.classList.toggle('active');
    overlay.classList.toggle('active');
  });

  // 오버레이 클릭 시 메뉴 닫힘
  overlay.addEventListener('click', () => {
    nav.classList.remove('active');
    overlay.classList.remove('active');
  });

  // 메뉴 항목 클릭 시 자동 닫힘 (모바일 UX)
  document.querySelectorAll('.main-nav a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('active');
      overlay.classList.remove('active');
    });
  });
});
