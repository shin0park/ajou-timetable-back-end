/*
 * Created by Lee SeungJun
 */
let codeTable = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

function timeTableDecoder(classList) {
  let timeTable = new Array();
  for (let i = 0; i < 26; i++) {
    timeTable[i] = new Array();
    for (let j = 0; j < 5; j++) {
      timeTable[i][j] = -1;
    }
  }

  for (let i = 0; i < classList.length; i++) {
    let decodeResult = timeDecoder(classList[i].Time);

    for (let k = 0; k < decodeResult.length; k++) {
      timeTable[decodeResult[k].row][decodeResult[k].col] = i;
    }
  }

  return timeTable;
}


function timeDecoder(encodedTime) {
  //1ABC 형태의 숫자를 TimeTableRenderer에 맞는 형식으로 디코딩함
  //반환 형식은 [{row: col:},...]의 배열 형태
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

function codeToRow(code) {
  return codeTable.indexOf(code);
}

  exports.timeTableDecoder = timeTableDecoder;
