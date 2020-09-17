var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db_config = require('../db_config/ajoutt_db.js');
var conn = mysql.createConnection(db_config);
var sql_register = 'INSERT INTO USER (Snumber, Password, Name, Dname, Grade, Nickname) VALUES(?,?,?,?,?,?)';
const passport = require('passport');
const bcrypt = require('bcrypt-nodejs');

const {isLoggedIn, isNotLoggedIn} = require('./middlewares');

/* GET users listing. */
router.get('/', function (req, res, next) {

    conn.query('SELECT * FROM DEPARTMENT', function (err, rows, fields) {
        if (!err) {
            res.json(rows);   
        } else {
            console.log("ERROR : " + err);
            res.send("failed");
        }
    });
});

//회원가입
router.post('/register', isNotLoggedIn, async (req, res, next) => {
    var params = [];
    const {sNumber, password, name, dName, grade, nickname} = req.body;
    let exUser = "";
    try {
        await conn.query('SELECT * FROM USER WHERE Snumber = ?', [sNumber], function (err, results, fields) {
            if (err) {
                console.log("ERROR : " + err);
            } else {
                console.log("success");
                exUser = results;
            }
            if (exUser[0] !== undefined) {
                console.log("alreadyRegister");
                req.flash('alreadyRegister', '이미 가입되었습니다.');
                return res.send("alreadyRegister");
            } else {
                //이미 가입된 회원 없다면 bcrypt로 비밀번호 암호화
                //console.time('암호화 시간');
                const hash = bcrypt.hashSync(password, bcrypt.genSaltSync(12), null);
                //console.timeEnd('암호화 시간');
                //gensaltsync 인자의 숫자 커질수록 암호화 복잡 but 속도 감소.
                for (var obj in req.body) {
                    params.push(req.body[obj]);
                }
                params[1] = hash;
                conn.query(sql_register, params, function (err, rows, fields) {
                    if (err) {
                        console.log("ERROR : " + err);
                    } else {
                        console.log("success register");
                    }
                });
                // db에 user 생성.
                return res.send('successRegister');
            }
        });

    } catch (error) {
        console.error(error);
        return next(error);
    }
});
//로그인
router.post('/login', isNotLoggedIn, (req, res, next) => {//req.body.sNumber / req.body.password
    passport.authenticate('local', (authError, user, info) => {//에러, 성공, 실패
        if (authError) {
            console.error(authError);
            return next(authError);
        }
        if (!user) {
            //사용자 정보 없으면 실패
            req.flash('loginError', info.message);//일회성 메세지
            return res.send('loginError');
        }
        return req.login(user, (loginError) => {
            //session 에 로그인 저장됨 이때 serializeUser가 실행되며 req.user로 사용자 정보 찾을수 있다.
            if (loginError) {
                console.error(loginError);
                return next(loginError);
            }
            return res.send('successLogin');
        })

    })(req, res, next);// 미들웨어 내의 미들웨어에는 (req, res, next)를 붙인다.
});
//로그아웃
router.get('/logout', isLoggedIn, (req, res) => {
    req.logout();
    req.session.destroy();
    return res.send('successLogout');
});
router.get('/info', isLoggedIn, (req, res) => {
    const user = {user: req.user};
    return res.send(user);
});

router.post('/modification', function (req, res, next){
    var params = [];
    const {sNumber, password, name, dName, grade, nickname} = req.body;
    const hash = bcrypt.hashSync(password, bcrypt.genSaltSync(12), null);
    for (var obj in req.body) {
        params.push(req.body[obj]);
    }
    params[1] = hash;
    params.push(sNumber);
    params.shift();

    conn.query('UPDATE USER SET Password = ?, Name = ?, Dname = ?, Grade = ?, Nickname =? WHERE Snumber = ?', params, function(err,rows,fields){
        if(err) console.log("ERROR : "+ err);
        else{
            let jason = {};
            if(rows.affectedRows == 0){
                jason.result = false;
                res.json(jason);
            }else{
                jason.result = true;
                res.json(jason);
            }
        }
    });
});
module.exports = router;
