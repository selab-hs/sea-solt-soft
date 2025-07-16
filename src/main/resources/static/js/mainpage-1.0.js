// DOM이 완전히 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
  // 요소 참조 가져오기
  const toggleBtn = document.getElementById('menuToggle'); // 햄버거 버튼
  const nav = document.getElementById('mainNav');          // 네비게이션 메뉴
  const overlay = document.getElementById('overlay');      // 배경 오버레이

  // [1] 햄버거 버튼 클릭 시: 메뉴 열기 / 닫기 + 배경 어둡게 토글
  toggleBtn.addEventListener('click', () => {
    nav.classList.toggle('active');       // 메뉴 열림/닫힘 클래스 토글
    overlay.classList.toggle('active');   // 배경 오버레이 보이기/숨기기 토글
  });

  // [2] 배경 오버레이 클릭 시: 메뉴 닫기
  overlay.addEventListener('click', () => {
    nav.classList.remove('active');
    overlay.classList.remove('active');
  });

  // [3] 메뉴 항목 클릭 시: 메뉴 닫기 (모바일 UX 개선)
  document.querySelectorAll('.main-nav a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('active');
      overlay.classList.remove('active');
    });
  });
});