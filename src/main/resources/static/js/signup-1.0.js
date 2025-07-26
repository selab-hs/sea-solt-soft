// signup.js - 회원가입 폼 처리 스크립트 (백엔드 DTO에 맞춰 필드명 수정 완료)

document.getElementById('signupForm').addEventListener('submit', async function (event) {
  event.preventDefault(); // 폼 기본 제출 동작(페이지 새로고침)을 막는다

  // 1. HTML 폼에서 입력값을 모두 가져온다
  const name = document.getElementById('name').value.trim();               // 이름
  const studentId = document.getElementById('studentId').value.trim();     // 학번
  const phone = document.getElementById('phone').value.trim();             // 전화번호
  const loginId = document.getElementById('username').value.trim();        // 아이디
  const password = document.getElementById('password').value;              // 비밀번호
  const confirmPassword = document.getElementById('confirmPassword').value; // 비밀번호 확인
  const email = document.getElementById('email').value.trim();             // 이메일
  const message = document.getElementById('signupMessage');                // 메시지 출력 DOM

  // 2. 빈칸 검사: 하나라도 비어있으면 회원가입 불가
  if (!name || !studentId || !phone || !loginId || !password || !confirmPassword || !email) {
    message.textContent = '모든 항목을 입력해주세요.';
    return;
  }

  // 3. 비밀번호 일치 검사
  if (password !== confirmPassword) {
    message.textContent = '비밀번호가 일치하지 않습니다.';
    return;
  }

  // 4. 이메일 형식 검사 (간단한 정규식 사용)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    message.textContent = '올바른 이메일 형식을 입력하세요.';
    return;
  }

  // 5. 비밀번호 길이 검사 (보안 상 최소 8자 이상 권장)
  if (password.length < 8) {
    message.textContent = '비밀번호는 최소 8자 이상이어야 합니다.';
    return;
  }

  // 6. 서버로 회원가입 정보를 전송한다 (백엔드 DTO 필드명에 맞춰 전송!)
  try {
    const res = await fetch('http://localhost:8080/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' // JSON 형식으로 전송
      },
      body: JSON.stringify({
        name,                               // 이름 → 백엔드의 name
        studentNumber: studentId,          // 학번 → 백엔드의 studentNumber
        phoneNumber: phone,                // 전화번호 → 백엔드의 phoneNumber
        userId: loginId,                   // 아이디 → 백엔드의 userId
        password,                          // 비밀번호 → 백엔드의 password
        email                              // 이메일 → 백엔드의 email
      })
    });

    // 7. 응답 결과 처리
    if (res.ok) {
      alert('회원가입 성공! 로그인 페이지로 이동합니다.');
      window.location.href = '../login/login-1.0.html'; // 로그인 페이지로 이동
    } else {
      const errorData = await res.json();
      message.textContent = errorData.message || '회원가입 실패. 입력값을 확인해주세요.';
    }
  } catch (err) {
    console.error('회원가입 오류:', err);
    message.textContent = '서버와의 연결에 실패했습니다.';
  }
});
