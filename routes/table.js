var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db_config = require('../db_config/ajoutt_db.js');
var conn = mysql.createConnection(db_config);
const algorithm = require('../algorithm/creditCombination.js');
const timeTableGenerator = require('../algorithm/timeTableGenerator');
const time_filter = require('../algorithm/timeFilter');

router.post('/', function(req, res, next) {
    let params = [];
    let jason = {};

    conn.query('SELECT * FROM CLASSKIND WHERE Lkind = ?', req.body.bigGroup, function(err,rows,fields){
        if(err){
                console.log("ERROR : "+err);
        }else{
            for(let key in rows){
                params.push(rows[key].Dname)
            }
            jason.result = params;
            res.json(jason);
        }
    });
});

router.get('/department', function(req,res,next){
    let params = [];
    let jason = {};

    conn.query('SELECT Dname FROM DEPARTMENT',function(err,rows,fields){
        if(err) console.log("ERROR : "+err);
        else{
            for(let key in rows){
                params.push(rows[key].Dname)
            }
            jason.result = params;
            res.json(jason);
        }
    });
});

router.post('/professor', function(req, res, next){
    let params = [];
    let jason = {};

    conn.query('SELECT Professor FROM TIMETABLE WHERE Dname = ? AND Lname = ?', req.body, function(err,rows,fields){
        if(err) console.log("ERROR : "+err);
        else{
            for(let key in rows){
                params.push(rows[key].Professor)
            }
            let unique = params.reduce(function(a,b){
                if(a.indexOf(b) < 0) a.push(b);
                return a;
            },[]);

            jason.result = unique;
            res.json(jason);
        }
    });
});
router.post('/lecture', function(req, res, next) {
    let params = [];
    let jason = {};

    conn.query('SELECT * FROM LECTURE WHERE Dname = ?', req.body.smallGroup, function(err,rows,fields){
        if(err){
                console.log("ERROR : "+err);
        }else{
            for(let key in rows){
                params.push(rows[key].Lname)
            }
            jason.result = params;
            res.json(jason)
        }
    });
});
/*
router.get('/myclass/:snumber', function(req, res, next){
    let arr = [];
    arr.push(req.params.snumber);
    conn.query('SELECT * FROM MYCLASS WHERE Snumber = ?', arr , function(err, rows, fields){
        if(err)console.log("ERROR : "+err)
        else{
            res.send(rows)
        }
    })
});
*/
router.post('/combination/:target', function(req, res, next) {
    let target = req.params.target;
    let jason = {};
    let res_param = new Array();
    let arr = new Array();

    for(let i = 0; i<req.body.length; i++){
        arr[i] = new Array();
    }

    let count = 0;
    
    for(var i = 0 ; i < req.body.length ; i++){
        var req_param = [];
        req_param.push(req.body[i].Dname);
        req_param.push(req.body[i].Lname);

        conn.query('SELECT * FROM TIMETABLE WHERE Dname = ? AND Lname = ?', req_param, function(err,rows,fields){
            if(err){
                    console.log("ERROR : "+err);
            }else{
                for(let key in rows){
                    res_param.push(JSON.parse(JSON.stringify(rows[key]))); //DB에서 가져온 데이터 JSON객체로 만들어 res_param에 푸시
                }
                
                for(var i = 0; i < res_param.length; i++){
                    arr[count].push(res_param[i]); // arr배열에 강의목록 푸시(같은 강의는 같은 행에), 2차원 배열
                }
                count++;
                res_param = [];
            }  

            if(count == req.body.length){
                let res_param = new Array();
                let decode = new Array();
                let tag = new Array();

                res_param = algorithm.allcombination(arr, target)                

                jason.result = res_param;
                
                for(let i = 0; i < res_param.length; i++){
                    decode = timeTableGenerator.timeTableDecoder(res_param[i])
                    tag.push(time_filter.time_filter(decode))
                }
                
                jason.tag = tag
                res.send(jason)
            
            }
        });
    }
});

module.exports = router;
