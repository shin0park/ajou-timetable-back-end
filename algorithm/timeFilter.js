/*
 * Created by Song Young uk
 */

function time_filter (input){ 	//input from time decoder
	let morning_counter = 0;
	let evening_counter = 0;
	let total_counter = 0;

	let lunch_counter = 5;
	let day_lunch_counter = 6;

	let isemptyday = false;
	let empty_day = 0;

	let gap_tok = false;
	let total_gap = [0,0,0,0,0];
	let tmp_gap;

	let tags = [];

	for(let row =0; row<5; row++){
		isemptyday = true;
		day_lunch_counter = 6;
		for(let col =0; col < 26; col++){
			if(input[col][row]>-1){
				if(gap_tok == false){
					total_gap[row] += tmp_gap;
					gap_tok = true
				}
				isemptyday = false;
				if(col<= 7 ){
					morning_counter++;
				}

				if(col>=8&&col<=13){
					day_lunch_counter--;
				}
				
				if(col> 13 ){
					evening_counter++;
				}	
				total_counter++;
			}
			else{
				gap_tok = false;
				tmp_gap++;
			}
		} //single day loop done
		if(day_lunch_counter <= 3){
			lunch_counter--;
		}
		if(isemptyday){
			empty_day++;
		}
	}
	if((morning_counter/total_counter) >= 0.51){//proportion of morning classes (~12:00)
		tags.push("아침형");
	}// when it is mornig tagged

	if((evening_counter/total_counter) >= 0.51){//proportion of evening classes (15:00~)
		tags.push("저녁형");
	}// when it is evening tagged

	if(lunch_counter>=4){ //lunch_counter = number of days with C or D class time empty
		tags.push("점심보장형");
	}// when it is lunch tagged

	if(empty_day >= 1){ //empty_day = number of days without any clasee
		tags.push("요일공강형");
	}// when it is empty day tagged

	let isvalidgap = true;
	let sum_gap = 0;

	for(let i =0;i<5;i++){
		sum_gap += total_gap[i];
		if(total_gap[i] > 6){ //at here, we check maximum gap per day
			isvalidgap = false;
		}		
	}

	if(isvalidgap && (sum_gap<=21)){
		tags.push("최소공강형");
    }// when it is minimum gap tagged
    
    //console.log(tags);
    return tags
}

exports.time_filter = time_filter;