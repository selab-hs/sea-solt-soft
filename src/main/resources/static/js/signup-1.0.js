// signup.js

document.getElementById('signupForm').addEventListener('submit', function(event) {
  event.preventDefault(); // 새로고침 방지

  const name = document.getElementById('name').value;
  const studentId = document.getElementById('studentId').value;
  const phone = document.getElementById('phone').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('signupMessage');

  // 간단한 유효성 검사
  if (password !== confirmPassword) {
    message.textContent = '비밀번호가 일치하지 않습니다.';
    return;
  }

  // 실제로는 여기서 서버로 데이터를 전송해야 함 (예: fetch 사용)
  // 이 예제에서는 성공 메시지 출력만
  message.style.color = 'green';
  message.textContent = '회원가입 성공!';

  // 폼 초기화
  this.reset();
});