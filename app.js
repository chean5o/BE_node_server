// const express = require("express"); // npm i express | yarn add express
// const cors    = require("cors");    // npm i cors | yarn add cors
// const mysql   = require("mysql");   // npm i mysql | yarn add mysql
// const app     = express();
// const PORT = 3000;
// // MySQL 연결
// var connection = mysql.createPool({
//     host:'localhost',
//     user: 'root',
//     password: 'Lime0874!!',
//     // port: 3306,
//     database: 'travel_app'
// });
// // app.use(cors({
// //   origin: "*",                // 출처 허용 옵션
// //   credentials: true,          // 응답 헤더에 Access-Control-Allow-Credentials 추가
// //   optionsSuccessStatus: 200,  // 응답 상태 200으로 설정
// // }))

// // post 요청 시 값을 객체로 바꿔줌
// app.use(express.urlencoded({ extended: true })) 

// // 서버 연결 시 발생
// app.listen(PORT, () => {
//   console.log(`server running on port ${PORT}`);
// });

// app.get("/api/company", (req, res) => {
//   res.header("Access-Control-Allow-Origin", "*");
  
//   const sqlQuery = "SELECT * FROM place";

//   connection.query(sqlQuery, (err, result) => {
//       res.send(result);
//   });
// });
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const KAKAO_API_KEY = process.env.KAKAO_API_KEY;
const KAKAO_API_URL = 'https://apis-navi.kakaomobility.com/v1/waypoints/directions';

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

app.post('/route', async (req, res) => {
    try {
        const requestData = {
            origin: { x: "126.7920981", y: "33.3055558" },
            destination: { x: "126.9405375", y: "33.45913497" },
            waypoints: [
                { name: "제주아트센터", x: 126.5155393, y: 33.47513108 }
            ],
            priority: "DISTANCE",
            car_fuel: "GASOLINE",
            car_hipass: false,
            alternatives: false,
            road_details: false
        };

        const response = await axios.post(KAKAO_API_URL, requestData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `KakaoAK ${KAKAO_API_KEY}`
            }
        });

        const routeData = response.data;
        res.json(routeData);
    } catch (error) {
        console.error(error);
        res.status(500).send('서버 에러 발생');
    }
});
module.exports = app;
// app.listen(port, () => {
//     console.log(`Node.js 서버가 포트 ${port}에서 실행 중입니다.`);
// });