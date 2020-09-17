let codeTable = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]


// let data = '[[{"Dname":"소프트웨어학과","Lname":"웹시스템설계","Time":"1OPQ3OPQ4CDEF","Professor":"오상윤","Credit":4,"Classroom":"팔325"}],[{"Dname":"소프트웨어학과","Lname":"운영체제","Time":"1IJK3IJK","Professor":"김재훈","Credit":3,"Classroom":"팔325"},{"Dname":"소프트웨어학과","Lname":"운영체제","Time":"3FGH5FGH","Professor":"김상훈","Credit":3,"Classroom":"팔325"}],[{"Dname":"소프트웨어학과","Lname":"자료구조및실습","Time":"2CDE3CDEF5CDE","Professor":"김승운","Credit":4,"Classroom":"팔309"},{"Dname":"소프트웨어학과","Lname":"자료구조및실습","Time":"2IJK4CDEF5IJK","Professor":"Paul Rajib","Credit":4,"Classroom":"팔410"},{"Dname":"소프트웨어학과","Lname":"자료구조및실습","Time":"2RST4OPQ5OPQR","Professor":"박진경","Credit":4,"Classroom":"팔309"}],[{"Dname":"소프트웨어학과","Lname":"인공지능","Time":"1OPQ3OPQ","Professor":"김민구","Credit":3,"Classroom":"팔407"}]] ';

// data = JSON.parse(data);

// allcombination(data, 19);


/*
classInfo는 수업들의 2차원 또는 1차원 배열입니다. 2차원 배열로 입력될 경우 자동으로 1차원 배열로 펼칩니다.
targetCredit은 목표 총 학점입니다. 예를 들어 19가 입력될 경우 +-1인 18, 19, 20학점에 해당하는 시간표가 계산됩니다.
*/
function allcombination(classInfo, targetCredit) {
  targetCredit = targetCredit * 1;

  if(isNaN(targetCredit)){
    throw new Error("targetCredit은 Number Type으로 입력되어야 합니다.");
  }

  let finalConfirmationGroupList = [];
  let linearClassInfo = [];

  for (let i = 0; i < classInfo.length; i++) {
    if (classInfo[i].length == 0) {
      continue;
    }
    linearClassInfo = linearClassInfo.concat(classInfo[i]);
  }

  if (linearClassInfo.length == 0) {
    return [];
  }


  //flagArray는 어느 수업이 선택 선택, 미 선택 상태인지 알려 주는 배열
  //1이면 선택되었다는 뜻.
  let flagArray = new Array(linearClassInfo.length);

  for (let i = 0; i < flagArray.length; i++) {
    flagArray[i] = 0;
  }

  node(flagArray, 0); //0번 수업 미선택
  flagArray[0] = 1;
  node(flagArray, 0); //1번 수업 선택


  //console.log("시간표 개수: " + finalConfirmationGroupList.length + "개");
  return finalConfirmationGroupList;


  function node(flagArray, depth) {
    if (flagArray[depth] == 1) {
      //방금 입력된 수업의 유효성을 검사한다.
      let conflictFlag = false;
      for (let i = 0; i < depth; i++) {
        if(flagArray[i] == 1){
          if(isConflict(linearClassInfo[i], linearClassInfo[depth]) == true){
            conflictFlag = true;
          }
        }
      }

      if(conflictFlag){
        return;//이 아래로는 더이상 검사할 필요가 없다.
      }
    }


    //현재 선택된 수업의 총 학점 세는 과정
    let credit = 0;

    for(let i=0; i<=depth; i++){
      if(flagArray[i] == 1){
          credit += linearClassInfo[i].Credit;
      }

    }

    if(credit >= targetCredit + 2){
      return;
    }

    if(credit == targetCredit + 1){
      //시간표 완성시 더 이상 수업 추가할 필요가 없음
      addResult(flagArray);
      return;
    }

    if(depth >= flagArray.length-1){
      //마지막 노드면 더이상 가지칠 자식이 없다.
      if(credit >= targetCredit -1){//마지막으로 조건 만족하는지 확인하고 결과 푸시
        addResult(flagArray);
      }
      return;
    }
    node(flagArray, depth+1); //다음 수업 미선택
    flagArray[depth+1] = 1;
    node(flagArray, depth+1); //다음 수업 선택
    flagArray[depth+1] = 0; //자식 함수 끝나고 다시 나한테 돌아왔을 때, flagArray의 상태를 원래대로 돌려준다.

    return;
  }


  function addResult(flagArray) {
    let classGroup = new Array();

    for(let i=0; i<flagArray.length; i++){
      if(flagArray[i] == 1){
          classGroup.push(linearClassInfo[i]);
      }
    }

    finalConfirmationGroupList.push(classGroup);
  }
}


function isConflict(alreadyClass, guest) {
  let guestTime = timeDecoder(guest.Time);
  let conflictFlag = false;

  if (alreadyClass.Lname == guest.Lname && alreadyClass.Dname == guest.Dname) {
    //중복되는 수업
    return true;
  }

  //중복되는 수업이 아니라면 시간 검사
  let alreadyClassTime = timeDecoder(alreadyClass.Time);
  return timeConflitTest(alreadyClassTime, guestTime);
}


function timeDecoder(encodedTime) {
  //반환 형식은 [{row: col:},...]의 배열 형태
  //row가 시간 col이 요일
  let row = -1;
  let col = -1;
  let result = new Array();

  for (let readPoint = 0; readPoint < encodedTime.length; readPoint++) {
    if (col == -1) {
      //숫자 읽을 차례
      col = (encodedTime[readPoint] * 1) - 1;
      continue;
    }

    //문자 읽을 차례
    row = codeToRow(encodedTime[readPoint]);
    result.push({
      row: row,
      col: col
    });
    if (isNaN(encodedTime[readPoint + 1] * 1) == false) {
      //다음 글자 미리 읽어 봤는데 숫자면
      col = -1; //다음 차례에 숫자를 읽도록 함.
    }
  }

  return result;
}

function timeConflitTest(timeA, timeB) {
  for (let a = 0; a < timeA.length; a++) {
    for (let b = 0; b < timeB.length; b++) {
      if (timeA[a].row == timeB[b].row && timeA[a].col == timeB[b].col) {
        return true;
      }
    }
  }

  return false;
}

function codeToRow(code) {
  return codeTable.indexOf(code);
}

function arrayDeepCopy(arr) {
  return JSON.parse(JSON.stringify(arr));
}

function isSameClass(classA, classB) {
  let prop = ["Dname", "Lname", "Time", "Professor", "Credit", "Classroom"];

  for (let p of prop) {
    if (classA[p] != classB[p]) {
      return false;
    }
  }

  return true;

}


function isSameGroup(groupA, groupB) {
  if (groupA.length != groupB.length) {
    return false;
  }


  for (let classA of groupA) {
    if (isIn(groupB, classA) == false) {
      return false;
    }
  }

  return true;
}

function isIn(group, classOne) {
  for (let x of group) {
    if (isSameClass(x, classOne) == true) {
      return true;
    }
  }

  return false;
}


exports.allcombination = allcombination;
