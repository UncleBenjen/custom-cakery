// SIMPLE & STRAIGHTFORWARD SINGLE-PAGE NODE SERVER
// Written by Ben Speir.

//required modules
var http = require('http'),
	express = require('express'),
	bodyParser = require('body-parser'),
	nodeMailer = require('nodemailer');


/* == APP CONFIGURATION == */
var app = express();
app.configure(function(){
	app.set('port',process.env.PORT || 3000);
	app.use(express.static(__dirname + '/public'));
	app.use(bodyParser.json());
	//app.use(express.favicon(__dirname + '/public/img/favicon.ico'));
});

/* == NODEMAILER CONFIGURATION == */
//Setting up stmp transtport object to send messages from robot account
var smtpTransport = nodeMailer.createTransport("SMTP",{
   service: "Gmail",
   auth: {
       user: "sarahs.custom.cakery@gmail.com",
       pass: "cupc4kes"
   }
});

/* == ROUTING == */
//
app.get('/', function(req,res){
	Console.log("\nhttp GET request received");
	res.header('Access-Control-Allow-Origin', "*") //Cross domain compatibility
	res.sendfile('./public/index.html');
});
//
app.post('/',function(req,res){
	console.log("\nhttp POST request received:");
	console.log(JSON.stringify(req.body));
	
	//create mailing options using data passed through ajax call
	var mailOptions = {
		to:'sarahs.custom.cakery@gmail.com',
		cc:req.body.email,
		subject: req.body.name+" wants to talk about a custom order!",
		text: "The following message was sent from "+req.body.name+":\n\n'"+req.body.message+"'\n\nReply to: "+req.body.email
	};

	var returnMessage = "";

	
	smtpTransport.sendMail(mailOptions, function(error, info){
	    if(error){
	        console.log(error);
	        returnMessage = "Error";
	    }else{
	        console.log('Message sent!');
	        returnMessage = "Success";
	    }
	});
	returnMessage = "pass";

	res.header('Access-Control-Allow-Origin', "*") //Cross domain compatibility
  	res.contentType('json');
  	res.send(JSON.stringify({message:returnMessage}));
});

/* == SERVER == */
http.createServer(app).listen(app.get('port'), function(){
	console.log('Server is up and running; listening on port '+app.get('port'));
});