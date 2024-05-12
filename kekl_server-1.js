const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// 가정된 장소별 좌표 매핑 딕셔너리
const placeCoordinates = {
    "돌하르방식당": "33.412255, 126.263622",
    "오는정김밥": "33.499010, 126.531106",
    "올래국수": "33.517235, 126.521698",
    "제주해녀의집": "33.450135, 126.914224",
    "물고기자리": "33.305771, 126.288797"
  };
  
// 받은 top_area_names 예시 (실제 사용 시 Flask에서 받아야 함)
// const top_area_names = ["Jeju International Airport", "Seongsan Ilchulbong", "Hallasan National Park", "Jeju Loveland", "Hyeopjae Beach"];
  
// top_area_names를 사용하여 좌표 리스트 생성

app.use(bodyParser.json());

app.post('/receive_data', async (req, res) => {
try {
    const AREA = req.body.AREA

    const places = AREA.map(area => placeCoordinates[area]);

    console.log(places);
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
    const shortestPath = findShortestRoute(graph); // 이 함수는 TSP 해결 알고리즘을 구현해야 합니다.

    // res.send({ shortestPath });
    console.log(shortestPath)
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

  try {
    const response = await axios.get(url, { params });
    if (response.status === 200) { // 여기를 수정
      const data = response.data;
      return data.rows[0].elements[0].duration.text;
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

    return `${shortestRoute.join('-')} 경로가 제일 빠릅니다`;
}

// console.log(findShortestRoute(graph));


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});