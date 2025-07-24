// signup.js - 회원가입 폼 처리 스크립트

document.getElementById('signupForm').addEventListener('submit', async function (event) {
  event.preventDefault(); // 폼 제출 시 새로고침 방지

  // 입력값 가져오기
  const name = document.getElementById('name').value.trim();
  const studentId = document.getElementById('studentId').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const loginId = document.getElementById('username').value.trim(); // loginId 필드명 주의!
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('signupMessage');

  // 1. 빈칸 검사
  if (!name || !studentId || !phone || !loginId || !password || !confirmPassword || !email) {
    message.textContent = '모든 항목을 입력해주세요.';
    return;
  }

  // 2. 비밀번호 일치 검사
  if (password !== confirmPassword) {
    message.textContent = '비밀번호가 일치하지 않습니다.';
    return;
  }

  // 3. 이메일 형식 검사 (간단한 정규식 사용)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    message.textContent = '올바른 이메일 형식을 입력하세요.';
    return;
  }

  // 4. 비밀번호 길이 검사
  if (password.length < 8) {
    message.textContent = '비밀번호는 최소 8자 이상이어야 합니다.';
    return;
  }

  // 5. 서버에 회원가입 요청 보내기
  try {
    const res = await fetch('http://localhost:8080/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        studentId,
        phone,
        loginId,
        password,
        email
      })
    });

    if (res.ok) {
      alert('회원가입 성공! 로그인 페이지로 이동합니다.');
      window.location.href = '/login-1.0.html'; // 로그인 페이지로 리디렉션
    } else {
      const errorData = await res.json();
      message.textContent = errorData.message || '회원가입 실패. 입력값을 확인해주세요.';
    }
  } catch (err) {
    console.error('회원가입 오류:', err);
    message.textContent = '서버와의 연결에 실패했습니다.';
  }
});
