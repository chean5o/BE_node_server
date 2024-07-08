// require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const http = require('http');
const https = require('https');
// const mongoose = require('mongoose');
// const AWS = require('aws-sdk');
// const KAKAO_API_KEY = process.env.KAKAO_API_KEY;
// const KAKAO_API_URL = 'https://apis-navi.kakaomobility.com/v1/waypoints/directions';
// const KAKAO_API_URL_SHORTDISTANCE = 'https://apis-navi.kakaomobility.com/v1/directions'
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://lime:dhcoms65!@cluster-capstone-001.afkiqw3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster-Capstone-001";
const uri_2 = "mongodb+srv://gksmrf16:VYiZgrbN5Q8CNnQM@cluster1.pnxohqu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1";
// const client_2 = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        // strict: true,
        // deprecationErrors: true,
    }
});
const client_2 = new MongoClient(uri_2);
let db, db2;
async function connectDB() {
    await client.connect();
    db = client.db('capstone');
    await client_2.connect();
    db2 = client_2.db('image');
    console.log("MongoDB connected");
}
connectDB();
const places = ['돗깨비', '금돈흑돼지', '아쿠아플라넷 제주', '성산일출봉', '오설록티뮤지엄'];

// 랜덤 장소 선택 함수
function getRandomPlace() {
    const index = Math.floor(Math.random() * places.length);
    return places[index];
  }
  // const randomPlace = places[Math.floor(Math.random() * places.length)];
let currentPlace = null;

// body-parser 미들웨어를 사용해 JSON 요청 본문을 파싱합니다.
app.use(bodyParser.json());



// app.get('/main_imageurl', async (req, res) => {
//   try {
//       const collection = db2.collection('image_coll');
//       const places = ['돗깨비', '금돈흑돼지', '아쿠아플라넷 제주', '성산일출봉', '오설록티뮤지엄'];
//       const randomPlace = places[Math.floor(Math.random() * places.length)];

//       // 선택된 장소에 대한 이미지 데이터 검색
//       const image_data = await collection.findOne({ keke_name: randomPlace });

      // 데이터베이스에서 이미지 데이터를 검색합니다.
    //   const image_data = await collection.findOne({ keke_name: '오설록티뮤지엄' });
    
    //   if (image_data && image_data.image_data && image_data.image_data.buffer) {
    //       // MongoDB에서 바이너리 데이터를 제대로 처리하기 위해 Buffer로 변환
    //       const buffer = Buffer.from(image_data.image_data.buffer, 'binary');
          
    //       // 적절한 Content-Type으로 응답을 설정합니다.
    //       res.type('jpeg'); // 이 부분은 실제 이미지 형식에 따라 'png', 'gif' 등으로 변경할 수 있습니다.
    //       res.send(buffer);
//       } else {
//           res.status(404).send('Image not found');
//       }
//   } catch (e) {
//       console.error('Error fetching image:', e);
//       res.status(500).send('Internal Server Error');
//   }
// });
app.get('/main_imageurl', async (req, res) => {
    try {
        const collection = db2.collection('image_coll');
        const places = ['돗깨비', '금돈흑돼지', '아쿠아플라넷 제주', '성산일출봉', '오설록티뮤지엄'];
        const randomPlace = places[Math.floor(Math.random() * places.length)];
  
        const imageData = await collection.findOne({ keke_name: randomPlace });

        // if (!placeInfo || !imageData || !imageData.image_data || !imageData.image_data.buffer) {
        //     return res.status(404).send('Data not found');
        // }

        // 이미지 바이너리 데이터를 Base64 문자열로 변환
        const imageBase64 = Buffer.from(imageData.image_data.buffer, 'binary').toString('base64');
        const imageResponse = `data:image/jpeg;base64,${imageBase64}`; // 이미지 형식에 따라 MIME type 수정

        // 응답 데이터 구성
        const response = {
            name: imageData.keke_name,
            address: imageData.ROAD_NM_ADDR,
            tot_review: imageData.tot_review,
            star: imageData.star,
            image: imageResponse // 이미지 데이터를 Base64 인코딩 문자열로 포함
        };

        res.json(response);
    } catch (error) {
        console.error('Error in fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
});

// app.get('/main_info', async (req, res) => {
//     try {
//         const places = db.collection('place');
//         const query = { VISIT_AREA_NM: currentPlace};
//         const result = await places.findOne(query);
//         if (result) {
//             res.json({
//                 name: result.VISIT_AREA_NM,
//                 address: result.ROAD_NM_ADDR,
//                 tot_review: result.tot_review,
//                 star: result.star
//             });
//         } else {
//             res.status(404).send('Place not found');
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Error connecting to the database');
//     }
// });


// '/receive_data' 엔드포인트를 설정합니다.
app.post('/receive_data', (req, res) => {
    // Flask로부터 받은 데이터를 콘솔에 출력합니다.
    console.log("Flask로부터 받은 데이터:", req.body);
    
    // 클라이언트에게 응답을 전송합니다.
    res.status(200).send({
        message: "데이터를 성공적으로 받았습니다."
    });
});


app.get('/find_map/:name', async (req, res) => {
  try {
      const places = db.collection('place');
      const regex = new RegExp(req.params.name, 'i');
      const query = { VISIT_AREA_NM: { $regex: regex } };
      const cursor = places.find(query);
      const results = await cursor.toArray();
      if (results.length > 0) {
        const formattedResults = results.map(place => ({
            name: place.VISIT_AREA_NM,
            address: place.ROAD_NM_ADDR,
            x_coord: place.X_COORD,
            y_coord: place.Y_COORD,
            star: place.star,
            service_rv: place.service,
            significant_rv: place.significant,
            time_rv: place.time,
            traffic_rv: place.traffic,
            tot_rv: place.tot_review
        }));

        console.log("Formatted Results:", JSON.stringify(formattedResults, null, 2)); // 결과를 예쁘게 출력

        res.json(formattedResults); // 클라이언트에 JSON 형식으로 결과 전송
    }  else {
          res.status(404).send('해당 장소를 찾을 수 없습니다.');
      }
  } catch (error) {
      console.error(error);
      res.status(500).send('Error connecting to the database');
  }
});

app.get('/find_map_img/:name', async (req, res) => {
  try {
    const collection = db2.collection('image_coll');
    // 데이터베이스에서 이미지 데이터를 검색합니다.
    const image_data = await collection.findOne({ keke_name: req.params.name });
    console.log(req.params.name)
    if (image_data && image_data.image_data && image_data.image_data.buffer) {
        // MongoDB에서 바이너리 데이터를 제대로 처리하기 위해 Buffer로 변환
        const buffer = Buffer.from(image_data.image_data.buffer, 'binary');
        
        // 적절한 Content-Type으로 응답을 설정합니다.
        res.type('jpeg'); // 이 부분은 실제 이미지 형식에 따라 'png', 'gif' 등으로 변경할 수 있습니다.
        res.send(buffer);
    } else {
        res.status(404).send('Image not found');
    }
} catch (e) {
    console.error('Error fetching image:', e);
    res.status(500).send('Internal Server Error');
}
});

app.get('/places/:category', async (req, res) => {
  try {
      const category = parseInt(req.params.category, 10);
      if (isNaN(category)) {
          return res.status(400).json({ error: 'Invalid category provided' });
      }
      
      // Projection을 사용하여 필요한 필드만 선택합니다.
      const cursor = db.collection('place').find(
          { VISIT_AREA_TYPE_CD: category },
          { projection: { VISIT_AREA_NM: 1, Y_COORD: 1, X_COORD: 1 } }
      ).limit(10);

      const areas = await cursor.toArray();
      if (areas.length > 0) {
          res.json(areas.map(place => ({
              name: place.VISIT_AREA_NM,
              y_coord: place.Y_COORD,
              x_coord: place.X_COORD
          })));
      } else {
          res.status(404).json({ message: "No areas found for the provided category." });
      }
  } catch (error) {
      console.error('Error during database query:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = app;
// app.listen(port, () => {
//     console.log(`Node.js 서버가 포트 ${port}에서 실행 중입니다.`);
// });