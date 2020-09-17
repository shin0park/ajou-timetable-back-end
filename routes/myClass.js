var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db_config = require('../db_config/ajoutt_db.js');
var conn = mysql.createConnection(db_config);
const {isLoggedIn} = require('./middlewares');
var sql_register = 'INSERT INTO MYCLASS (Snumber, Dname, Lname, Time, Professor, Credit, Classroom) VALUES(?,?,?,?,?,?,?)';

//내 시간표 불러오기
router.get('/', isLoggedIn, async (req, res, next) => {
    try {
        const sNumber = req.user.Snumber;
        await conn.query('SELECT * FROM MYCLASS WHERE Snumber = ?', [sNumber], function (err, rows, fields) {
            if (!err) {
                console.log("rows : " + rows);
            } else {
                console.log("ERROR : " + err);
            }
            console.log(rows);
            res.json(rows);
        });

    } catch (err) {
        console.log(err);
        return next(err);
    }
});

//내 시간표 등록
router.post('/', isLoggedIn, async (req, res, next) => {
    const sNumber = req.user.Snumber;
    try {
        let params = [];
        let jsonObj = req.body;
        for (var key in jsonObj) {
            params = [];
            params.push(sNumber);
            for (var obj in jsonObj[key]) {
                params.push(jsonObj[key][obj]);
            }
            await conn.query(sql_register, params, function (err, results, fields) {
                if (err) {
                    console.log("ERROR : " + err);
                } else {
                    console.log("success");
                }
            });
        }
        res.send("successMyClass");
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.post('/myclasses', function (req, res, next){
    let timetable = JSON.stringify(req.body.Timetable);
    let tag = JSON.stringify(req.body.Tag);

    conn.query('INSERT INTO MYCLASSES (Snumber, Timetable, Tag) VALUES (?,?,?)',[req.body.Snumber,timetable,tag], function (err, rows, fields){
        if(err) res.send(err.code);
        else res.send('Success');
    });
});

router.get('/myclasses/:snumber', function (req, res, next){
    
    conn.query('SELECT * FROM MYCLASSES WHERE Snumber = ?', [req.params.snumber], function (err, rows, fields) {
        if (!err) {
            if(rows.length == 0){
                res.send(rows)
            }else{
                let jason = JSON.parse(JSON.stringify(rows));
            
                for(let i = 0; i < jason.length; i++){
                    let timetable = JSON.parse(jason[i].Timetable);
                    let send_jason = new Array();
                    for(let j = 0; j < timetable.length; j++){
                        conn.query('SELECT Sumscore, Count FROM TIMETABLE WHERE Dname = ? and Lname = ? and Time = ? and Professor = ?',
                        [timetable[j].Dname, timetable[j].Lname, timetable[j].Time, timetable[j].Professor], function (err, rows, fields) {
                            if (!err) {
                                let res_param = new Array();
                                for(let key in rows){
                                    res_param.push(JSON.parse(JSON.stringify(rows[key])));
                                }
                                timetable[j].Sumscore = res_param[0].Sumscore;
                                timetable[j].Count = res_param[0].Count;
                                send_jason.push(timetable[j]);
                                if(j == timetable.length - 1){
                                    jason[i].Timetable = JSON.stringify(send_jason)
                                    if(i == jason.length - 1){
                                        res.send(jason)
                                    }
                                }
                            } else {
                                console.log("ERROR : " + err);
                                res.send("failed");
                            }
                        });
                    }
                }
            }
        } else {
            res.send("failed");
            console.log("ERROR : "+err);
        }
    });
});

router.delete('/myclasses/:id', function (req, res, next){

    conn.query('DELETE FROM MYCLASSES WHERE id = ?', [req.params.id], function (err, rows, fields) {
        if (!err) {
            if(rows.affectedRows == 0){
                res.send('Delete failed')
            }else{
                res.send('Success')
            }
        } else {
            console.log("ERROR : "+err);
        }
    });
});
module.exports = router;