// 에디터 포맷 명령 실행
function formatText(command, value = null) {
  document.execCommand(command, false, value);
}

// 글쓰기 저장 기능
document.getElementById('write-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const title = document.getElementById('title').value.trim();
  const content = document.getElementById('editor').innerHTML.trim();

  if (!title || !content) {
    alert('제목과 본문을 모두 입력해주세요.');
    return;
  }

  // 숨은 필드에 에디터 내용 저장
  document.getElementById('content-hidden').value = content;

  const posts = JSON.parse(localStorage.getItem('posts') || '[]');
  posts.unshift({ title, content, date: new Date().toLocaleString() });
  localStorage.setItem('posts', JSON.stringify(posts));

  alert('✅ 글이 저장되었습니다!');
  this.reset();
  document.getElementById('editor').innerHTML = '';
});

// 햄버거 메뉴 토글
const toggleBtn = document.getElementById('menuToggle');
const nav = document.getElementById('mainNav');
const overlay = document.getElementById('overlay');

toggleBtn.addEventListener('click', () => {
  nav.classList.toggle('active');
  overlay.classList.toggle('active');
});

overlay.addEventListener('click', () => {
  nav.classList.remove('active');
  overlay.classList.remove('active');
});
