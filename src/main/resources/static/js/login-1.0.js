// login-1.0.js 로그인 폼 처리 스크립트

// 로그인 폼 제출 시 이벤트 리스너 등록
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault(); // 기본 폼 제출(새로고침) 동작 방지

  //  입력값 가져오기
  const id = document.getElementById('username').value.trim();
  const pw = document.getElementById('password').value.trim();
  const message = document.getElementById('message');
  const loginBtn = document.getElementById('login-btn');

  // 메시지 초기화
  message.textContent = '';
  message.style.color = 'red';

  //  빈 칸 검사
  if (!id || !pw) {
    message.textContent = '아이디와 비밀번호를 모두 입력해주세요.';
    return;
  }

  //  로그인 중 버튼 비활성화
  loginBtn.disabled = true;
  loginBtn.textContent = '로그인 중...';

  try {
    //  서버로 로그인 요청 전송
    const res = await fetch('http://localhost:8080/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        loginId: id,   // 서버 요구 필드명에 맞춰 전송
        password: pw
      })
    });

    //  서버 응답 처리
    if (res.ok) {
      // JWT 토큰은 응답 헤더의 Authorization에 포함됨
      let token = res.headers.get('Authorization');

      // "Bearer " 접두어 제거
      if (token?.startsWith('Bearer ')) {
        token = token.substring(7); // "Bearer " 길이 = 7
      }

      // 토큰이 있다면 localStorage에 저장
      if (token) {
        localStorage.setItem('jwtToken', token); // 향후 인증에 사용할 토큰 저장
        alert('로그인 성공!');
        window.location.href = '/dashboard.html'; // 로그인 후 이동
      } else {
        message.textContent = '로그인 실패: 토큰이 존재하지 않습니다.';
      }
    } else {
      // 실패 응답: 에러 메시지 출력
      const errorText = await res.text();
      message.textContent = errorText || '로그인 실패: 아이디 또는 비밀번호를 확인해주세요.';
    }

  } catch (err) {
    // 네트워크 오류 또는 서버 다운 등
    console.error('서버 연결 오류:', err);
    message.textContent = '서버 오류가 발생했습니다. 나중에 다시 시도해주세요.';
  } finally {
    // 버튼 상태 복원
    loginBtn.disabled = false;
    loginBtn.textContent = '로그인';
  }
});

//  회원가입 버튼 클릭 시 회원가입 페이지로 이동
document.querySelector('.signup-button').addEventListener('click', () => {
  window.location.href = '/sign-up';
});
