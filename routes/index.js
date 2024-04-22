var express = require('express');
var router = express.Router();
var db = require('../lib/database.js');

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: '시작' });
//   db.query('select * from testTable', function(err, results, fields){
//     if (err) throw err;
//     console.log(results);
//     res.json(results);
//   });
// });
router.get('/', (req, res) => {
  // 데이터베이스 쿼리 실행
  db.query('SELECT * FROM testTable', (err, results) => {
      if (err) {
          console.error(err);
          res.status(500).send('Internal Server Error');
          return;
      }

      // 쿼리 결과를 클라이언트에게 보여주기
      res.render('index', { data: results }); // 여기서 index는 템플릿 파일명, results는 쿼리 결과
  });
});

// router.get('/', function(req, res, next){
//   db.query('select * from testTable', function(err, results, fields){
//     if (err) throw err;
//     console.log(results);
//     res.json(results);
//   });
// })

module.exports = router;
