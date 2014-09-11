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
	console.log("\nhttp GET request received");
	res.header('Access-Control-Allow-Origin', "*") //Cross domain compatibility
	res.sendfile('./public/index.html');
});
//
app.post('/',function(req,res){
	console.log("\nhttp POST request received:");
	console.log(JSON.stringify(req.body));
	
	var date = new Date();

	//create mailing options using data passed through ajax call
	var mailOptions = {
		to:req.body.email,
		//cc:'sarahs.custom.cakery@gmail.com',
		subject: "Automatic message from Custom Cakery",
		text: "Hi "+req.body.name+",\n\n Thanks for taking interest in my custom cake business! Unfortunately, I will be too busy with school to fill any orders :( \nPlease check back next summer when I'm done school! I apologize for any inconvenience I may have caused. \n\nThe following message was automatically sent to my personal email on "+date+":\n'"+req.body.message+"'."
	};

	var returnMessage = "";

	
	smtpTransport.sendMail(mailOptions, function(error, info){
	    if(error){
	        console.log(error);
	        returnMessage = "Error";
	    }else{
	        console.log('Sending Message...');
	        console.log(info);
	        
	        console.log('The following recipients were accepted:');
	        console.log(info.accepted);
	        console.log('The following recipients were rejected:');
	        console.log(info.rejected);

	        console.log('SMTP response code:');
	        console.log(info.messageId);

	        returnMessage = "Success";
	    }
	});

	res.header('Access-Control-Allow-Origin', "*") //Cross domain compatibility
  	res.contentType('json');
  	res.send(JSON.stringify({message:returnMessage}));
});

/* == SERVER == */
http.createServer(app).listen(app.get('port'), function(){
	console.log('Server is up and running; listening on port '+app.get('port'));
});