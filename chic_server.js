const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// body-parser 미들웨어를 사용해 JSON 요청 본문을 파싱합니다.
app.use(bodyParser.json());

// '/receive_data' 엔드포인트를 설정합니다.
app.post('/receive_data', (req, res) => {
    // Flask로부터 받은 데이터를 콘솔에 출력합니다.
    console.log("Flask로부터 받은 데이터:", req.body);
    
    // 클라이언트에게 응답을 전송합니다.
    res.status(200).send({
        message: "데이터를 성공적으로 받았습니다."
    });
});

app.listen(port, () => {
    console.log(`Node.js 서버가 포트 ${port}에서 실행 중입니다.`);
});
