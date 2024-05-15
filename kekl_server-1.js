const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// 가정된 장소별 좌표 매핑 딕셔너리
// const placeCoordinates = {
//     // "돌하르방식당": "33.412255, 126.263622",
//   };
// const places = []; 
app.use(bodyParser.json());

app.post('/receive_data', (req, res) => {
  console.log('Received data:', req.body); // 받은 데이터를 콘솔에 출력
  res.status(200).send('Data received successfully.'); // 클라이언트에게 응답 보내기
});

// const location = req.body;

app.post('/receive_data1', async (req, res) => {
try {

    let placeCoordinates = {};
    let places = [];
    console.log(req.body);
    // console.log(placeCoordinates);
    // req.body가 배열인 경우 각 요소를 순회
    req.body.forEach(location => {
      const { AREA, X_COORD, Y_COORD } = location;

      // placeCoordinates에 위치 정보 저장
      placeCoordinates[AREA] = `${Y_COORD}, ${X_COORD}`;
      if (!places.includes(AREA)) {
        places.push(AREA);
      }
      // console.log(places)
    });

    // res.status(200).send('Data received and processed successfully.');

    // if (!places.includes(AREA)) {
    //   places.push(AREA);
    // }

    console.log(placeCoordinates);
    const durations = [];
    const calculatedPairs = new Set(); // 이미 계산된 조합을 저장할 Set

    for (let i = 0; i < places.length; i++) {
    for (let j = i + 1; j < places.length; j++) { // j는 항상 i보다 크므로 중복 계산 방지
        // 조합 키 생성 (순서에 관계없이 같은 키를 가짐)
        const pairKey = [places[i], places[j]].sort().join('-');

        if (!calculatedPairs.has(pairKey)) { // 아직 계산되지 않은 조합이면
        const duration = await getDuration(places[i], places[j]);
        durations.push(`${i + 1}번째 장소에서 ${j + 1}번째 장소까지 이동 시간: ${duration}`);
        durations.push(`${j + 1}번째 장소에서 ${i + 1}번째 장소까지 이동 시간: ${duration}`); // 역방향도 동일한 시간으로 추가
        calculatedPairs.add(pairKey); // 계산된 조합으로 등록
        // console.log(calculatedPairs)
        }
    }
    }
    // durations 배열 예시

    const graph = {};
    
    durations.forEach((duration) => {
        const [_, from, to, time] = duration.match(/(\d+)번째 장소에서 (\d+)번째 장소까지 이동 시간: (\d+)/);
        if (!graph[from]) graph[from] = {};
        graph[from][to] = parseInt(time, 10);
    });
    const shortestPath = findShortestRouteWithCoordinates(places, coordinatesDict, graph); // 이 함수는 TSP 해결 알고리즘을 구현해야 합니다.

    // res.send({ shortestPath });
    // console.log(shortestPath)
} catch (error) {
    res.status(500).send({ message: "서버에서 정보 처리 중 문제가 발생했습니다.", error: error.message });
}
});

async function getDuration(origin, destination, mode = "transit") {
  // API 요청을 위한 URL 및 파라미터 설정
  const url = "https://maps.googleapis.com/maps/api/distancematrix/json";
  const params = {
    units: "metric",
    mode: mode, // 이동 수단, 기본값은 대중교통
    origins: origin,
    destinations: destination,
    region: "KR",
    key: "AIzaSyAEmtMKAuj8EpOhLK1AwNsmfarx6wREX-w" // 환경 변수에서 API 키를 가져옵니다
  };

  // try {
  //   const response = await axios.get(url, { params });
  //   if (response.status === 200) { // 여기를 수정
  //     const data = response.data;
  //     return data.rows[0].elements[0].duration.text;
  //   } else {
  //     return "API 요청 실패";
  //   }
  // } catch (error) {
  //   console.error(error);
  //   return "정보를 찾을 수 없습니다.";
  // }
  try {
    const response = await axios.get(url, { params });
    if (response.status === 200 && response.data.status === "OK") {
      const elements = response.data.rows[0]?.elements;
      if (elements && elements.length > 0 && elements[0].status === "OK") {
        const durationText = elements[0].duration.text;
        const timeParts = durationText.split(' ');
        let totalMinutes = 0;
        // console.log(timeParts)
        for (let i = 0; i < timeParts.length; i += 2) {
          // console.log(1)
          const value = parseInt(timeParts[i], 10);
          const unit = timeParts[i + 1];
          if (unit.startsWith('hour')) {
            totalMinutes += value * 60;
          } else if (unit.startsWith('min')) {
            totalMinutes += value;
          }
        }
        console.log(totalMinutes)
        return totalMinutes + " mins";
      } else {
        return "경로 정보를 가져올 수 없습니다.";
      }
    } else {
      return "API 요청 실패";
    }
  } catch (error) {
    console.error(error);
    return "정보를 찾을 수 없습니다.";
  }
}

function generatePermutations(list) {
    if (list.length <= 1) {
        return [list];
    }

    const permutations = [];
    const [first, ...rest] = list;
    const restPermutations = generatePermutations(rest);

    restPermutations.forEach(permutation => {
        for (let i = 0; i <= permutation.length; i++) {
            const start = permutation.slice(0, i);
            const end = permutation.slice(i);
            permutations.push([...start, first, ...end]);
        }
    });

    return permutations;
}

// 가장 짧은 경로를 찾는 함수
function findShortestRoute(graph) {
    const cities = Object.keys(graph);
    const allRoutes = generatePermutations(cities);
    let shortestDistance = Infinity;
    let shortestRoute = [];

    allRoutes.forEach(route => {
        let routeDistance = 0;
        for (let i = 0; i < route.length - 1; i++) {
            routeDistance += graph[route[i]][route[i + 1]];
        }
        // 마지막 도시에서 시작 도시로 돌아가는 거리 추가
        routeDistance += graph[route[route.length - 1]][route[0]];

        if (routeDistance < shortestDistance) {
            shortestDistance = routeDistance;
            shortestRoute = route;
        }
    });

    // return `${shortestRoute.join('-')} 경로가 제일 빠릅니다`;
    return `${shortestRoute.join('-')} 경로가 제일 빠릅니다`;

  }

  function findShortestRouteWithCoordinates(places, coordinatesDict, graph) {
    const cities = Object.keys(graph);
    const allRoutes = generatePermutations(cities);
    let shortestDistance = Infinity;
    let shortestRoute = [];
    console.log(shortestRoute)
    allRoutes.forEach(route => {
        let routeDistance = 0;
        for (let i = 0; i < route.length - 1; i++) {
            routeDistance += graph[route[i]][route[i + 1]];
        }
        // 마지막 도시에서 시작 도시로 돌아가는 거리 추가
        routeDistance += graph[route[route.length - 1]][route[0]];

        if (routeDistance < shortestDistance) {
            shortestDistance = routeDistance;
            shortestRoute = route;
        }
    });

    // 위치 이름과 좌표를 포함하는 결과 문자열 생성
    const result = shortestRoute.map(index => {
        const placeName = places[index - 1]; // 배열은 0부터 시작하므로 인덱스 조정
        const coordinates = coordinatesDict[placeName];
        return `${placeName} / ${coordinates}`;
    }).join(' - ');

    return `${result} 경로가 제일 빠릅니다`;
}

// // 사용 예:
// const places = ['제주국제공항', '수목원길야시장', '카페블루하우스 서귀포시청점', '에스제이렌트카', '루프탑정원'];
// const coordinatesDict = {
// '제주국제공항': '33.50707896, 126.492769',
// '수목원길야시장': '33.47014229, 126.4878862',
// '카페블루하우스 서귀포시청점': '33.25192834, 126.5592179',
// '에스제이렌트카': '33.49844111, 126.4770068',
// '루프탑정원': '33.2838596, 126.7454082'
// };

// console.log(findShortestRouteWithDetails(places, coordinatesDict));

// console.log(findShortestRoute(graph));


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});