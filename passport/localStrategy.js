const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt-nodejs');
const mysql = require('mysql');
const db_config = require('../db_config/ajoutt_db.js');
const conn = mysql.createConnection(db_config);

module.exports = (passport) => {
    passport.use(new LocalStrategy({
        usernameField: 'sNumber', //req.body.sNumber
        passwordField: 'password',//req.body.password
    }, async (sNumber, password, done) => {
        //done(에러, 성공, 실패)
        try {
            let exUser = "";
            conn.query('SELECT * FROM USER WHERE Snumber = ?', [sNumber], function (err, results, fields) {
                if (err) {
                    console.log("ERROR : " + err);
                } else {
                    console.log("success");
                    exUser = results;
                }
                //아이디 있는지 검사
                if (exUser[0]) {
                    //있으면 비밀번호 검사
                    const result = bcrypt.compareSync(password, exUser[0].Password);
                    if (result) {
                        done(null, exUser[0]);
                    } else {
                        done(null, false, {message: '이메일-비밀번호 조합이 맞지 않습니다.'});
                    }
                } else {
                    //에러x,성공x,실패정보o
                    done(null, false, {message: '이메일-비밀번호 조합이 맞지 않습니다.'});
                }
            });
        } catch (error) {
            console.error(error);
            done(error);
        }
    }));
};