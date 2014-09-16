// A SIMPLE SINGLE-PAGE NODE SERVER
// Written by Ben Speir.

/* == REQUIRED MODULES == */
var http = require('http'),
	express = require('express'),
	bodyParser = require('body-parser'),
	nodeMailer = require('nodemailer'),
	emailExistence = require('email-existence');


/* == EXPRESS CONFIGURATION == */
var app = express();
app.configure(function(){
	app.set('port',process.env.PORT || 3000);
	app.use(express.static(__dirname + '/public'));
	app.use(bodyParser.json());
	//app.use(express.favicon(__dirname + '/public/img/favicon.ico'));
});

/* == NODEMAILER CONFIGURATION == */
//Setting up stmp transtport object to send messages from robot account
var transporter = nodeMailer.createTransport({
   service: "Gmail",
   auth: {
       user: "sarahs.custom.cakery@gmail.com",
       pass: "cupc4kes"
   }
});

/* == ROUTING == */
//
app.get('/', function(req,res){
	console.log("\nhttp GET request received");
	res.header('Access-Control-Allow-Origin', "*") //Cross domain compatibility
	res.sendfile('./public/index.html');
});
//
app.post('/',function(req,res){
	console.log("\nhttp POST request received:");
	console.log(JSON.stringify(req.body));
	
	//create and initialize a date object for future reference
	var date = new Date();

	//create mailing options using data passed through ajax call
	var mailOptions = {
		to:req.body.email,
		//cc:'sarahs.custom.cakery@gmail.com',
		subject: "Automatic message from Custom Cakery",
		text: "Hi "+req.body.name+",\n\n\tThanks for taking interest in my custom cake business! Unfortunately, I will be too busy with school to fill any orders :( \nPlease check back next summer when I'm done school! I apologize for any inconvenience I may have caused. \n\n\nThe following message was automatically sent to my personal email on "+date+":\n'"+req.body.message+"'."
	};

	//initialize return message
	var returnMessage = "";

	//Check given email for existance before trying to send
	console.log('Checking if '+req.body.email+' is valid...');
	emailExistence.check(req.body.email, function(err,res){
		//if there was an error notify user/set return message. Do not send email
		if(err){
			console.log("An error occurred while checking the email...");
			console.log(err);
			returnMessage="Error Checking Email";
		}
		//if there was no error, check response... if true send email, if not alert user
		else{
			if(res==true){
				transporter.sendMail(mailOptions, function(error, info){
				    if(error){
				        console.log(error);
				        returnMessage = "SMTP Error";
				    }else{
				        console.log('Sending Message...');
				        console.log(info.response);

				        returnMessage = "Message Sent";
				    }
				});
			}
			else{
				console.log("The supplied email does not exist...");
				returnMessage="Invalid Email";
			}
		}
	});

	//Set header, content-type, and return message to client
	res.header('Access-Control-Allow-Origin', "*") //Cross domain compatibility
  	res.contentType('json');
  	res.send(JSON.stringify({message:returnMessage}));
});

/* == SERVER == */
http.createServer(app).listen(app.get('port'), function(){
	console.log('Server is up and running; listening on port '+app.get('port'));
});