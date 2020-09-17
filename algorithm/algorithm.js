/*
 * 강의 목록 조합이 들어있는 배열.
 * 배열의 길이가 강의 목록의 개수와 동일해질 때, 즉 조합이 다 갖추어졌을때 dup_comp()함수에서 체크함.
 */
var comb_param = [];

// table.js로 리턴하는 배열. 가능한 조합이 들어있음
var send_arr = [];

// 7행까지 있는 배열. 시간표의 중복을 검사하기 위해 2차원 배열. allcombination()에서 초기화
var arr = [];

// Time string에 있는 숫자에 따라 글자가 arr배열의 알맞은 행에 삽입되기 위한 flag
var flag = 0;

// 중복되지 않는 시간표 조합만 세기 위한 변수
var count = 0;



// 가능한 모든 조합 구하는 함수(dfs)
function allcombination(param, value){
    if(value == 0){
        send_arr = [];
        comb_param = [];
        flag = 0;
        count = 0;
        arr = [];
    }
    if(value == param.length){
        for(let i = 0 ; i<7;i++){arr[i] = [];}
        dup_comp();
        return;
    }
    for(let i = 0; i < param[value].length; i++){
        comb_param.push(param[value][i]);
        allcombination(param, value + 1);
        comb_param.pop();
    }
    console.log(send_arr)
    return JSON.parse(JSON.stringify(send_arr));
}

//시간표 비교 함수
function dup_comp(){
    /* 
     * Time string에서 숫자가 나오면 flag를 변환시켜 2차원배열인 arr의 행 순서를 지정한다. (ex. 1의 경우 arr[0]으로 지정)
     * Time string에서 숫자가 아닌 글이 나오면 arr의 지정된 열로 삽입
     */
    for(let i = 0; i < comb_param.length; i++){
        for(let j = 0; j < comb_param[i].Time.length; j++){
            if(comb_param[i].Time[j] - '0' == 1) flag = 0;
            else if(comb_param[i].Time[j] - '0' == 2) flag = 1;
            else if(comb_param[i].Time[j] - '0' == 3) flag = 2;
            else if(comb_param[i].Time[j] - '0' == 4) flag = 3;
            else if(comb_param[i].Time[j] - '0' == 5) flag = 4;
            else if(comb_param[i].Time[j] - '0' == 6) flag = 5;
            else if(comb_param[i].Time[j] - '0' == 7) flag = 6;
            else arr[flag].push(comb_param[i].Time[j]);
        }
    }
    /*
     * arr은 행이 1 ~ 7까지 있음
     * 1행부터 7행까지 각각의 행에 중복되는 글자가 있는지 체크
     * 중복되는게 있으면 is_dup = true;
     */
    let is_dup = false;
    for (let i = 0; i < 7; i++) {
        if (arr[i]) {
            for (let j = 0; j < arr[i].length - 1; j++) {
                for (let k = j + 1; k < arr[i].length; k++) {
                    if (arr[i][j] == arr[i][k]) is_dup = true;
                }
            }
        }
    }
    /*
     * 중복되지 않은 강의목록 조합만 send_arr에 푸시
     */
    if(!is_dup){
        send_arr[count] = [];
        for(let i = 0; i < comb_param.length; i++){
            send_arr[count].push(comb_param[i]);
        }
        count++;
    }
}


// 중복시간표까지 모두 다 뽑는 함수
function allcombination1(param, value){
    if(value == param.length){
        for(let i = 0; i < comb_param.length; i++){
            console.log(comb_param[i]);
        }
        console.log("--------------------")
        return;
    }
    for(let i = 0; i < param[value].length; i++){
        comb_param.push(param[value][i]);
        allcombination(param, value + 1);
        comb_param.pop();
    }
}
exports.allcombination = allcombination;
