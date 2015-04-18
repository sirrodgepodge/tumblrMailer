var fs = require('fs');
var ejs = require('ejs');
var tumblr = require('tumblr.js');
var mandrill = require('mandrill-api/mandrill');

var mandrillClient = new mandrill.Mandrill('PtGH2XHUVMG4tSXZ73p2Gw');

var client = tumblr.createClient({
    consumer_key: 'oIiBEkyd6a4zWS6abVOhgPW8USXQmBJ2BlSlAa3rM2cPmCxqc1',
    consumer_secret: 'bl5ovV0wJp9KCOPZYr5UwRKgNC8ZqZrEWLY3tuml0g3nbqHDik',
    token: 'po7hyudgpMwu1V2hCC87b5uhWiII80vMdDnUwLZC5wIZIjvCMX',
    token_secret: 'mk6bnxjfRtLEv4uD1PbgjTdnuY9ky1YYdllHBLA2LAisxYx3Q1'
});

function sendEmail(first_name, last_name, to_email, message_html) {
    var message = {
	"html": message_html,
	"subject": "Blog Update",
	"from_email": "rwcbeaman@gmail.com",
	"from_name": "the Rodge",
	"to": [{
	    "email": to_email,
	    "name": first_name + " " + last_name
	}],
	"important": false,
	"track_opens": true,
	"auto_html": true,
	"preserve_recipients": true,
	"merge": false,
	"tags": ["Fullstack_TumblrMailer_Workshop", "heyyy"]	
    };
    mandrillClient.messages.send({"message":message, "async":false, "ip_pool":"Main Pool"},function(result){
	console.log(result);
    }, function(e){
	console.log("A mandrill error occurred: " + e.name + " - " + e.message);
    });
}
    
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

var template = fs.readFileSync("email_template.html","utf8");
var csvFile = fs.readFileSync("friend_list.csv", "utf8");
var friendList = csvParse(csvFile);

var sendToFriends = function(blogUrl, posts) {
    if(posts.length > 0){
	friendList.forEach(function(friend){
	    var firstName = friend.firstName;
	    var lastName = friend.lastName;
	    var emailAddress = friend.emailAddress;
	    
	    var emailTemplate = ejs.render(template,{
		firstName: firstName,
		monthsSinceContact: friend.monthsSinceContact,
		blogLink: blogUrl,
		blogPosts: posts
	    });
	    sendEmail(firstName, lastName, emailAddress, emailTemplate);
	});
    }
};

client.posts('sirrodgepodge.tumblr.com', function(err, blog) {
    var posts = []
    blog.posts.forEach(function(thePost){
	var postDate = new Date(thePost.date);
	if(Date.now()-postDate.getTime() !== 622800000) {
	    posts.push(thePost);
	}
    });
    sendToFriends(blog.blog.url, posts);
});
