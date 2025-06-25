// login.js 
// 로그인 버튼을 눌렀을 때 실행되는 JavaScript 코드

// 1. 로그인 버튼을 찾아서 클릭 이벤트를 붙여줘요
document.getElementById('login-btn').addEventListener('click', () => {
  // 2. 입력된 아이디와 비밀번호 값을 가져와요
  const id = document.getElementById('username').value; // 아이디 입력값
  const pw = document.getElementById('password').value; // 비밀번호 입력값

  // 3. 백엔드 서버로 로그인 정보를 보낼 준비를 해요
  fetch('http://localhost:8080/api/login', { // 서버 주소 (백엔드가 만든 API 주소)
    method: 'POST', // POST 방식으로 요청 (로그인 정보는 숨겨야 하니까)
    headers: { 
      'Content-Type': 'application/json' // JSON 형식으로 보낸다고 알려줌
    },
    body: JSON.stringify({ // 실제 보낼 데이터 (자바스크립트 객체를 문자열로 변환)
      username: id, 
      password: pw
    })
  })
    // 4. 응답을 받아서 처리해요
    .then(res => res.json()) // 응답을 JSON 형태로 바꿔줌
    .then(data => {
      // 5. 로그인 성공 여부를 확인하고 처리
      if (data.success) {
        alert('로그인 성공!'); // 성공하면 알림창 띄우기
        // 여기에 페이지 이동이나 토큰 저장 로직을 넣을 수 있어요
      } else {
        document.getElementById('message').textContent = '로그인 실패'; // 실패 메시지 출력
      }
    })
    .catch(err => { // 서버 오류나 네트워크 문제 있을 때 실행
      console.error('에러:', err);
      document.getElementById('message').textContent = '서버 오류';
    });
});
