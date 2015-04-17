var fs = require('fs');

var csvFile = fs.readFileSync("friend_list.csv", "utf8");

var csvParse = function(csv) {
    var output = [];
    csv = csv.split('\n');
    var props = csv.shift().replace(/\s/g,'').split(',');
    
    for(var i=0; i < csv.length; i++) {
	csv[i] = csv[i].split(',');
	output[i] = {};
	for(var j=0; j < props.length; j++) {
	    output[i][props[j]]= csv[i][j].trim();
	}
    }
    return output;
};

var friendList = csvParse(csvFile);
var emailTemplate = fs.readFileSync("email_template.html","utf8");

friendList.forEach(function(friend){
    var output = "";
    output = emailTemplate.replace(/FIRST_NAME/gi,friend.firstName).replace(/NUM_MONTHS_SINCE_CONTACT/gi,friend.monthsSinceTalk);
    console.log(output);
});
