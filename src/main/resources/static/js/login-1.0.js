// login-1.0.js

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('username').value.trim();
  const pw = document.getElementById('password').value.trim();
  const message = document.getElementById('message');
  const loginBtn = document.getElementById('login-btn');

  message.textContent = '';
  message.style.color = 'red';

  if (!id || !pw) {
    message.textContent = '아이디와 비밀번호를 모두 입력해주세요.';
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = '로그인 중...';

  try {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginId: id, password: pw })
    });

    if (res.ok) {
      const headerToken = res.headers.get('Authorization');
      if (headerToken) {
        if (window.API?.setToken) window.API.setToken(headerToken);
        else localStorage.setItem('Authorization', headerToken);

        alert('로그인 성공!');
        window.location.replace('/posts');
      } else {
        message.textContent = '로그인 실패: 토큰이 존재하지 않습니다.';
      }
    } else {
      const errorText = await res.text();
      message.textContent = errorText || '로그인 실패: 아이디 또는 비밀번호를 확인해주세요.';
    }
  } catch (err) {
    console.error('서버 연결 오류:', err);
    message.textContent = '서버 오류가 발생했습니다. 나중에 다시 시도해주세요.';
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = '로그인';
  }
});

//  회원가입 버튼 클릭 시 회원가입 페이지로 이동
document.querySelector('.signup-button')?.addEventListener('click', () => {
  window.location.href = '/sign-up';
});
