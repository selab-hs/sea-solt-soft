// login.js 
// 로그인 버튼을 눌렀을 때 실행되는 JavaScript 코드다.

//  로그인 버튼을 찾아서 클릭 이벤트를 등록한다.
document.getElementById('login-btn').addEventListener('click', () => {
  //  입력된 아이디와 비밀번호 값을 가져온다.
  const id = document.getElementById('username').value; // 아이디 입력값이다.
  const pw = document.getElementById('password').value; // 비밀번호 입력값이다.

  //  백엔드 서버로 로그인 정보를 보낼 준비를 한다.
  fetch('http://localhost:8080/api/login', { // 서버 주소 (백엔드에서 만든 API 주소다.)
    method: 'POST', // POST 방식으로 요청한다. (로그인 정보는 숨겨야 하므로 사용한다.)
    headers: { 
      'Content-Type': 'application/json' // JSON 형식으로 보낸다고 알린다.
    },
    body: JSON.stringify({ // 보낼 데이터를 JSON 문자열로 변환한다.
      username: id, 
      password: pw
    })
  })
    //  응답을 받아서 처리한다.
    .then(res => res.json()) // 응답을 JSON 형태로 변환한다.
    .then(data => {
      //  로그인 성공 여부를 확인하고 처리한다.
      if (data.success) {
        alert('로그인 성공!'); // 성공 시 알림창을 띄운다.
        // 페이지 이동이나 토큰 저장 로직을 여기에 추가할 수 있다.
      } else {
        document.getElementById('message').textContent = '로그인 실패'; // 실패 메시지를 출력한다.
      }
    })
    .catch(err => { // 서버 오류나 네트워크 문제가 발생했을 때 실행된다.
      console.error('에러:', err);
      document.getElementById('message').textContent = '서버 오류'; // 오류 메시지를 출력한다.
    });
});
