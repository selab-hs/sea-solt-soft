// 회원가입 화면 스크립트
// - 아이디 중복 확인(경쟁 요청 취소/무시 처리)
// - 기본 입력 검증(이메일/전화/비밀번호 일치 등)
// - 백엔드 상태코드별 메시지 분기(200/409/404/기타)
// - 성공 시 로그인 화면으로 이동

let isIdChecked = false;   // 현재 입력된 아이디에 대해 "중복확인 완료" 여부
let lastCheckedId = "";    // 마지막으로 중복확인 성공한 아이디 값(변경 시 다시 확인 필요)

// ====== 공통 엘리먼트 ======
const usernameEl    = document.getElementById('username');
const checkIdMsgEl  = document.getElementById('checkIdMessage'); // 아이디 중복확인 결과 메시지 영역
const signupMsgEl   = document.getElementById('signupMessage');  // 회원가입 전체 결과/오류 메시지 영역
const checkBtn      = document.getElementById('checkIdBtn');

// 간단한 메시지 유틸: 엘리먼트에 텍스트/색상 적용
function setMsg(el, text, color = '') {
  if (!el) return;
  el.textContent = text;
  el.style.color = color || '';
}

// ====== 입력 변경 시, 중복확인 상태 초기화 ======
// 사용자가 아이디 입력을 바꾸면 이전 "중복확인 완료" 상태는 더 이상 유효하지 않다.
if (usernameEl) {
  usernameEl.addEventListener('input', () => {
    isIdChecked = false;
    lastCheckedId = '';
    setMsg(checkIdMsgEl, '');
    setMsg(signupMsgEl, '');
  });
}

// ====== 요청 경쟁 상태/취소 대비 ======
// 여러 번 버튼을 눌러 중복 요청이 생길 수 있으므로, 앞선 요청을 취소(AbortController)하거나
// 응답 도착 순서가 뒤바뀌었을 때 최신 요청만 반영하도록 토큰을 사용한다.
let currentAbort = null;     // 진행 중인 fetch를 취소하기 위한 컨트롤러
let lastRequestToken = 0;    // 마지막 요청의 식별자(증가값)

// ====== 아이디 중복 확인 ======
checkBtn?.addEventListener('click', async function () {
  const loginId = (usernameEl?.value || '').trim();
  const message = checkIdMsgEl;

  // 빈 입력 가드
  if (!loginId) {
    setMsg(message, '아이디를 입력해주세요.', 'red');
    isIdChecked = false;
    return;
  }

  // 이전 요청이 진행 중이면 취소
  if (currentAbort) currentAbort.abort();
  currentAbort = new AbortController();
  const signal = currentAbort.signal;

  // 버튼 상태/안내 갱신
  const prevBtnText = checkBtn.textContent;
  checkBtn.disabled = true;
  checkBtn.textContent = '확인 중...';
  setMsg(message, '중복 여부를 확인하는 중입니다...', '#555');

  // 이 요청을 구분하는 토큰(응답이 늦게 와도 최신 요청만 반영하기 위함)
  const reqToken = ++lastRequestToken;

  try {
    // 백엔드 규약: /api/v1/auth/check-id?loginId=...
    const res = await fetch(`/api/v1/auth/check-id?loginId=${encodeURIComponent(loginId)}`, {
      method: 'GET',
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
      signal
    });

    // 사용자가 그 사이에 또 다른 요청을 보냈다면, 이 응답은 버린다.
    if (reqToken !== lastRequestToken) return;

    // ====== 확정 규약: 존재(409), 미존재(200) ======
    if (res.status === 200) {
      setMsg(message, '사용 가능한 아이디입니다.', 'green');
      isIdChecked = true;
      lastCheckedId = loginId;
      return;
    }
    if (res.status === 409) {
      setMsg(message, '이미 사용 중인 아이디입니다.', 'red');
      isIdChecked = false;
      return;
    }

    // ====== 호환 처리: 서버 구현이 다를 수도 있는 경우 대비 ======
    if (res.status === 404) {
      // 어떤 구현에서는 "미존재"를 404로 줄 수도 있다.
      setMsg(message, '사용 가능한 아이디입니다.', 'green');
      isIdChecked = true;
      lastCheckedId = loginId;
      return;
    }
    if (res.ok) {
      // 200 OK에 { available: true/false } JSON을 줄 수 있으니 파싱 시도
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        try {
          const data = await res.json();
          if (typeof data?.available === 'boolean') {
            if (data.available) {
              setMsg(message, '사용 가능한 아이디입니다.', 'green');
              isIdChecked = true;
              lastCheckedId = loginId;
            } else {
              setMsg(message, '이미 사용 중인 아이디입니다.', 'red');
              isIdChecked = false;
            }
            return;
          }
        } catch {
          // 바디가 없거나 JSON이 아닐 수 있음 → 아래 공통 에러로
        }
      }
    }

    // 위 분기 어디에도 해당되지 않으면 서버 오류로 간주
    setMsg(message, '서버 오류로 중복 확인에 실패했습니다.', 'red');
    isIdChecked = false;

  } catch (err) {
    // AbortError: 사용자가 새로 확인을 눌러 이전 요청을 취소한 경우 → 무시
    if (err.name === 'AbortError') return;
    console.error('아이디 중복 확인 오류:', err);
    setMsg(checkIdMsgEl, '서버에 연결할 수 없습니다.', 'red');
    isIdChecked = false;

  } finally {
    // 마지막 요청에 대한 응답/에러인 경우에만 버튼 상태 원복
    if (reqToken === lastRequestToken) {
      checkBtn.disabled = false;
      checkBtn.textContent = prevBtnText;
    }
  }
});

// ====== 회원가입 제출 ======
document.getElementById('signupForm')?.addEventListener('submit', async function (event) {
  event.preventDefault();

  // 입력값 수집
  const name            = (document.getElementById('name')?.value || '').trim();
  const studentId       = (document.getElementById('studentId')?.value || '').trim();
  const phone           = (document.getElementById('phone')?.value || '').trim();
  const loginId         = (usernameEl?.value || '').trim();
  const password        = (document.getElementById('password')?.value || '');
  const confirmPassword = (document.getElementById('confirmPassword')?.value || '');
  const email           = (document.getElementById('email')?.value || '').trim();
  const message         = signupMsgEl;

  // ====== 기본 검증 ======
  if (!name || !studentId || !phone || !loginId || !password || !confirmPassword || !email) {
    setMsg(message, '모든 항목을 입력해주세요.', 'red');
    return;
  }
  if (password !== confirmPassword) {
    setMsg(message, '비밀번호가 일치하지 않습니다.', 'red');
    return;
  }
  // 단순 이메일 형식 검사
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setMsg(message, '올바른 이메일 형식을 입력하세요.', 'red');
    return;
  }
  if (password.length < 8) {
    setMsg(message, '비밀번호는 최소 8자 이상이어야 합니다.', 'red');
    return;
  }
  // 010으로 시작하는 10~11자리(하이픈 없이)
  const phoneRegex = /^010\d{7,8}$/;
  if (!phoneRegex.test(phone)) {
    setMsg(message, '전화번호는 010으로 시작하고 하이픈 없이 숫자만 입력하세요.', 'red');
    return;
  }
  // 아이디 중복확인 필수: 마지막으로 확인한 값과 현재 입력값이 동일해야 함
  if (!isIdChecked || lastCheckedId !== loginId) {
    setMsg(message, '아이디 중복 확인을 먼저 해주세요.', 'red');
    return;
  }

  // ====== 회원가입 요청 ======
  try {
    const res = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // DTO 필드명은 백엔드 규격에 맞춰 전송
        name,
        studentNumber: studentId,
        phoneNumber: phone,
        userId: loginId,   // 백엔드에서 userId로 받도록 되어 있음
        password,
        email
      })
    });

    if (res.ok) {
      alert('회원가입 성공! 로그인 페이지로 이동합니다.');
      window.location.href = '/sign-in';
      return;
    }

    // 실패 시: 서버가 보내는 JSON { message } 또는 텍스트 응답 본문을 시도해 사용자에게 보여줌
    let errorMessage = '회원가입 실패. 입력값을 확인해주세요.';
    try {
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const errorData = await res.json();
        if (errorData?.message) errorMessage = errorData.message;
      } else {
        const text = await res.text();
        if (text) errorMessage = text;
      }
    } catch {
      // 본문이 없을 수도 있음 → 기본 메시지 유지
    }

    setMsg(message, errorMessage, 'red');

  } catch (err) {
    console.error('회원가입 오류:', err);
    setMsg(message, '서버와의 연결에 실패했습니다.', 'red');
  }
});

// ====== 전화번호 숫자만, 11자리 제한 ======
// oninput 시점에 숫자 이외 제거 + 최대 길이 캡
document.getElementById('phone')?.addEventListener('input', function () {
  let value = this.value.replace(/[^0-9]/g, '');
  if (value.length > 11) value = value.slice(0, 11);
  this.value = value;
});
