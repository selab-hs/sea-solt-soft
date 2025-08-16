// 상태 플래그
let isIdChecked = false;
let lastCheckedId = "";

// 요소 참조
const usernameEl   = document.getElementById('username');
const checkIdMsgEl = document.getElementById('checkIdMessage');
const signupMsgEl  = document.getElementById('signupMessage');
const checkBtn     = document.getElementById('checkIdBtn');

// 메시지 유틸
function setMsg(el, text, color=''){ if(!el) return; el.textContent = text; el.style.color = color || ''; }

// 아이디 입력 변경 시 중복확인 초기화
usernameEl?.addEventListener('input', () => {
  isIdChecked = false; lastCheckedId = ''; setMsg(checkIdMsgEl, ''); setMsg(signupMsgEl, '');
});

// 중복요청 제어
let currentAbort = null;
let lastRequestToken = 0;

// 아이디 중복 확인 (★ loginId 파라미터 사용)
checkBtn?.addEventListener('click', async () => {
  const loginId = (usernameEl?.value || '').trim();
  if (!loginId) { setMsg(checkIdMsgEl, '아이디를 입력해주세요.', 'red'); isIdChecked = false; return; }

  if (currentAbort) currentAbort.abort();
  currentAbort = new AbortController();
  const signal = currentAbort.signal;

  const prevBtnText = checkBtn.textContent;
  checkBtn.disabled = true; checkBtn.textContent = '확인 중...';
  setMsg(checkIdMsgEl, '중복 여부를 확인하는 중입니다...', '#555');

  const reqToken = ++lastRequestToken;

  try {
    const res = await fetch(`/api/v1/auth/check-id?loginId=${encodeURIComponent(loginId)}`, {
      method:'GET', headers:{ 'Accept':'application/json' }, cache:'no-store', signal
    });

    if (reqToken !== lastRequestToken) return;

    if (res.status === 200) { // 사용 가능
      setMsg(checkIdMsgEl, '사용 가능한 아이디입니다.', 'green');
      isIdChecked = true; lastCheckedId = loginId; return;
    }
    if (res.status === 409) { // 이미 존재
      setMsg(checkIdMsgEl, '이미 사용 중인 아이디입니다.', 'red');
      isIdChecked = false; return;
    }

    // 다른 구현 대비(선택)
    if (res.ok) {
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        try {
          const data = await res.json();
          if (typeof data?.available === 'boolean') {
            if (data.available) { setMsg(checkIdMsgEl, '사용 가능한 아이디입니다.', 'green'); isIdChecked = true; lastCheckedId = loginId; }
            else { setMsg(checkIdMsgEl, '이미 사용 중인 아이디입니다.', 'red'); isIdChecked = false; }
            return;
          }
        } catch {}
      }
    }
    setMsg(checkIdMsgEl, '서버 오류로 중복 확인에 실패했습니다.', 'red');
    isIdChecked = false;

  } catch (err) {
    if (err.name !== 'AbortError') { console.error(err); setMsg(checkIdMsgEl, '서버에 연결할 수 없습니다.', 'red'); isIdChecked = false; }
  } finally {
    if (reqToken === lastRequestToken) { checkBtn.disabled = false; checkBtn.textContent = prevBtnText; }
  }
});

// 폼 제출
document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name            = (document.getElementById('name')?.value || '').trim();
  const studentId       = (document.getElementById('studentId')?.value || '').trim();
  const phone           = (document.getElementById('phone')?.value || '').trim();
  const loginId         = (usernameEl?.value || '').trim();
  const password        = (document.getElementById('password')?.value || '');
  const confirmPassword = (document.getElementById('confirmPassword')?.value || '');
  const email           = (document.getElementById('email')?.value || '').trim();

  if (!name || !studentId || !phone || !loginId || !password || !confirmPassword || !email) { setMsg(signupMsgEl, '모든 항목을 입력해주세요.', 'red'); return; }
  if (password !== confirmPassword) { setMsg(signupMsgEl, '비밀번호가 일치하지 않습니다.', 'red'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setMsg(signupMsgEl, '올바른 이메일 형식을 입력하세요.', 'red'); return; }
  if (password.length < 8) { setMsg(signupMsgEl, '비밀번호는 최소 8자 이상이어야 합니다.', 'red'); return; }
  if (!/^010\d{7,8}$/.test(phone)) { setMsg(signupMsgEl, '전화번호는 010으로 시작하고 하이픈 없이 숫자만 입력하세요.', 'red'); return; }
  if (!isIdChecked || lastCheckedId !== loginId) { setMsg(signupMsgEl, '아이디 중복 확인을 먼저 해주세요.', 'red'); return; }

  try {
    const res = await fetch('/api/v1/auth/register', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ name, studentNumber:studentId, phoneNumber:phone, userId:loginId, password, email })
    });

    if (res.ok) { alert('회원가입 성공! 로그인 페이지로 이동합니다.'); window.location.href = '/sign-in'; return; }

    let errorMessage = '회원가입 실패. 입력값을 확인해주세요.';
    try {
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await res.json();
        if (data?.message) errorMessage = data.message;
      } else {
        const text = await res.text(); if (text) errorMessage = text;
      }
    } catch {}

    setMsg(signupMsgEl, errorMessage, 'red');
  } catch (err) {
    console.error(err);
    setMsg(signupMsgEl, '서버와의 연결에 실패했습니다.', 'red');
  }
});

// 전화번호: 숫자만, 11자리 제한
document.getElementById('phone')?.addEventListener('input', function () {
  let v = this.value.replace(/[^0-9]/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  this.value = v;
});

// 비밀번호 보기/숨김 토글
function attachPwToggle(inputId, btnId){
  const input = document.getElementById(inputId);
  const btn   = document.getElementById(btnId);
  if(!input || !btn) return;

  const icon = btn.querySelector('.mi'); // visibility / visibility_off
  btn.setAttribute('aria-pressed','false');
  btn.setAttribute('aria-label','비밀번호 보기');
  if(icon) icon.textContent = 'visibility_off';

  btn.addEventListener('click', ()=>{
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.setAttribute('aria-pressed', String(show));
    btn.setAttribute('aria-label', show ? '비밀번호 숨기기' : '비밀번호 보기');
    if(icon) icon.textContent = show ? 'visibility' : 'visibility_off';
  });
}
attachPwToggle('password','togglePwBtn');
attachPwToggle('confirmPassword','toggleConfirmPwBtn');
