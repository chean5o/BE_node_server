var createError = require('http-errors');
var express = require('express');
var path = require('path');
var bodyParser = require("body-parser")
var cookieParser = require('cookie-parser'); // DB 암호
var logger = require('morgan');
//코틀린 연동 확인
var express = require('express')
var http = require('http');
var app = express();
var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({extended: false}))
app.get(`/`, (req, res) => {
  console.log(req.query);
  res.send({"result": "GET 호출"});
})

app.post(`/`, (req, res) => {
  console.log(req.body);
  res.send({"result": "POST 호출"});
})
// JSON 형식의 요청 본문을 파싱하는 미들웨어
app.use(bodyParser.json());
app.post('/', (req, res) => {
  const { file_name } = req.body;

  const options = {
      method: 'POST',
      url: "http://127.0.0.1:5000/test",
      qs: { file_name: file_name }
  };

  request(options, (error, response, body) => {
      if (error) {
          console.error("Error:", error);
          return res.status(500).send({ message: "Internal Server Error" });
      }
      try {
          const result = JSON.parse(body);
          res.send({
              message: "From Flask",
              status: "Success",
              data: result
          });
      } catch (parseError) {
          console.error("Error parsing JSON:", parseError);
          res.status(500).send({ message: "Error parsing JSON" });
      }
  });
});

app.put(`/:id`, (req, res) => {
  console.log(`내용 PrimaryKey : ${req.params.id}`)
  console.log(req.body);
  res.send({"result": "UPDATE 호출"});
})

app.delete(`/:id`, (req, res) => {
  console.log(req.params.id);
  console.log(req.path)
  res.send({"result": "DELETE 호출"});
})

// app.listen(port, () => {
//   console.log(`서버 실행, 포트 번호 3000`);
// });

// module.exports = app;
// DB 연결 코드
// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

// var app = express();

// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'pug');

// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

module.exports = app;
