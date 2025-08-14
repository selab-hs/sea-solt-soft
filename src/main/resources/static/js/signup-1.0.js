// signup-1.0.js

let isIdChecked = false;
let lastCheckedId = "";

// ====== 1) 아이디 중복 확인 (loginId 파라미터 사용) ======
document.getElementById('checkIdBtn').addEventListener('click', async function () {
  const loginId = document.getElementById('username').value.trim();
  const message = document.getElementById('checkIdMessage');

  if (!loginId) {
    message.textContent = '아이디를 입력해주세요.';
    message.style.color = 'red';
    isIdChecked = false;
    return;
  }

  try {
    // 상대경로 사용
    const res = await fetch(`/api/v1/auth/check-id?loginId=${encodeURIComponent(loginId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.available) {
        message.textContent = '사용 가능한 아이디입니다.';
        message.style.color = 'green';
        isIdChecked = true;
        lastCheckedId = loginId;
      } else {
        message.textContent = '이미 사용 중인 아이디입니다.';
        message.style.color = 'red';
        isIdChecked = false;
      }
    } else {
      message.textContent = '서버 오류로 중복 확인에 실패했습니다.';
      message.style.color = 'red';
      isIdChecked = false;
    }
  } catch (err) {
    console.error('아이디 중복 확인 오류:', err);
    message.textContent = '서버에 연결할 수 없습니다.';
    message.style.color = 'red';
    isIdChecked = false;
  }
});

// ====== 2) 회원가입 제출 ======
document.getElementById('signupForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const name = document.getElementById('name').value.trim();
  const studentId = document.getElementById('studentId').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const loginId = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('signupMessage');

  if (!name || !studentId || !phone || !loginId || !password || !confirmPassword || !email) {
    message.textContent = '모든 항목을 입력해주세요.';
    return;
  }
  if (password !== confirmPassword) {
    message.textContent = '비밀번호가 일치하지 않습니다.';
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    message.textContent = '올바른 이메일 형식을 입력하세요.';
    return;
  }
  if (password.length < 8) {
    message.textContent = '비밀번호는 최소 8자 이상이어야 합니다.';
    return;
  }
  const phoneRegex = /^010\d{7,8}$/;
  if (!phoneRegex.test(phone)) {
    message.textContent = '전화번호는 010으로 시작하고 하이픈 없이 숫자만 입력하세요.';
    return;
  }
  if (!isIdChecked || lastCheckedId !== loginId) {
    message.textContent = '아이디 중복 확인을 먼저 해주세요.';
    return;
  }

  try {
    // 상대경로 사용 + 바디 필드명 백엔드에 맞춤 (loginId / studentId / phone)
    const res = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        studentNumber: studentId,
        phoneNumber: phone,
        userId: loginId,
        password,
        email
      })
    });

    if (res.ok) {
      alert('회원가입 성공! 로그인 페이지로 이동합니다.');
      window.location.href = '/sign-in';
    } else {
      let errorMessage = '회원가입 실패. 입력값을 확인해주세요.';
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        console.warn('JSON 파싱 실패:', e);
      }
      message.textContent = errorMessage;
    }
  } catch (err) {
    console.error('회원가입 오류:', err);
    message.textContent = '서버와의 연결에 실패했습니다.';
  }
});

// ====== 3) 전화번호 숫자만, 11자리 제한 ======
document.getElementById('phone').addEventListener('input', function () {
  let value = this.value.replace(/[^0-9]/g, '');
  if (value.length > 11) value = value.slice(0, 11);
  this.value = value;
});
