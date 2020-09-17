const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const logger = require('morgan');


// vur router를 이용한 SPA 개발시, 모든 get요청을 루트의 index.html로 돌려 주기 위한 미들웨어
// 이승준 추가
const history = require('connect-history-api-fallback');

require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var tableRouter = require('./routes/table');
var reviewRouter = require('./routes/review');
var myClassRouter = require('./routes/myClass');

const passportConfig = require('./passport');

var app = express();


passportConfig(passport);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    },
}));


app.use(flash());
app.use(passport.initialize());//passport 설정 초기화
app.use(passport.session());

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/table', tableRouter);
app.use('/review', reviewRouter);
app.use('/myClass', myClassRouter);

//위에서 걸리지 않은 get은 모두 vue로 넘김, 이승준 작성
app.use(history()); //express.static보다 먼저 있어야지 뷰 라우터랑 연결됨. 이승준 작성
app.use(express.static(path.join(__dirname, 'public')));

/*
404 에러 핸들링은 이제 프론트에서 진행됩니다. by 이승준
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});
*/

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
