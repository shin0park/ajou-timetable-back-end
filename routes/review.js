var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db_config = require('../db_config/ajoutt_db.js');
var conn = mysql.createConnection(db_config);

const {isLoggedIn, isNotLoggedIn} = require('./middlewares');

//등록된 강의평가 불러오기
router.get('/', async (req, res, next) => {
    try {
        await conn.query('SELECT * FROM REVIEW', function (err, rows, fields) {
            if (!err) {
                console.log("rows : " + rows);
            } else {
                console.log("ERROR : " + err);
            }
            rows.sort(function (a, b) {
                return b.id - a.id;
            });
            for (let i = 0; i < rows.length; i++) {
                conn.query('SELECT * FROM TIMETABLE WHERE Dname = ? AND Lname = ? AND Professor = ?', [rows[i].Dname, rows[i].Lecture, rows[i].Professor], function (err, results, fields) {
                    if (!err) {
                        rows[i].Average = parseFloat(results[0].Sumscore) / results[0].Count;
                        if (i === rows.length - 1) {
                            res.json(rows);
                        }
                    } else {
                        console.log("ERROR : " + err);
                    }
                });
            }
        });
    } catch (err) {
        console.log(err);
    }
});

//강의평가 등록
router.post('/', isLoggedIn, async (req, res, next) => {
    var params = [];
    try {
        params.push(req.user.Snumber);
        for (var obj in req.body) {
            params.push(req.body[obj]);
        }
        await conn.query('INSERT INTO REVIEW (Snumber, Dname, Lecture, Professor, Comment, Score) VALUES(?,?,?,?,?,?)', params, async function (err, rows, fields) {
            if (err) {
                console.log("ERROR : " + err);
                if(JSON.stringify(err).includes('ER_DUP_ENTRY')){
                    await res.send('ER_DUP_ENTRY')
                }
            } else {
                await conn.query('SELECT * FROM TIMETABLE WHERE Dname = ? AND Lname = ? AND Professor = ?', [params[1], params[2], params[3]], async function (err, rows, fields) {
                    if (!err) {
                        console.log(rows);
                        let score = parseFloat(params[5]);
                        let temp1, temp2;
                        temp1 = parseFloat(rows[0].Sumscore);
                        temp2 = parseInt(rows[0].Count);
                        let count = parseInt(temp2 + 1);
                        score = score + temp1;
                        
                        await conn.query('UPDATE TIMETABLE SET Sumscore = ?, Count = ? WHERE Dname = ? AND Lname = ? AND Professor = ?', [score, count, params[1], params[2], params[3]], async function (err, rows, fields) {
                            if (!err) {
                                console.log("rows : " + rows);
                            } else {
                                console.log("ERROR : " + err);
                            }
                        });
                    } else {
                        console.log("ERROR : " + err);
                    }
                });
                await res.send('successReview');
            }
        });
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

module.exports = router;