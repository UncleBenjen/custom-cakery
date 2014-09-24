// A SIMPLE SINGLE-PAGE NODE SERVER
// Written by Ben Speir.

/* == REQUIRED MODULES == */
var express = require('express'),
	bodyParser = require('body-parser'),
	nodeMailer = require('nodemailer'),
	emailExistence = require('email-existence');


/* == EXPRESS CONFIGURATION == */
var app = express();
var PORT = process.env.PORT || 3000;
var options = {
	index:false,
	maxAge:'1d',
	redirect:false,
	setHeaders: function(res,path){
		res.set('Access-Control-Allow-Origin', "*");
	}
};
app.use(express.static(__dirname + '/public',options));
app.use(bodyParser.json());


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
app.route('/')
	.get(function(req,res){
		console.log("\nhttp GET request received");
		//res.header('Access-Control-Allow-Origin', "*") //Cross domain compatibility
		//if (!res.getHeader('Cache-Control')) res.header('Cache-Control', 'public, max-age=' + (maxAge / 1000)); //setting up cache control 
		
		var options = {
    		root: __dirname + '/public/',
    		dotfiles: 'deny',
    		headers: {
        		'x-timestamp': Date.now(),
        		'x-sent': true,
        		'Last-Modified': (new Date()).toUTCString()//hack to stop 304 error status
    		}
 		};
		res.sendFile('index.html', options,function(err){
			if(err){
				console.log(err);
				res.status(err.status).end();
			}
			else{
				console.log('Index.html sent successfully');
			}
		});
	})
	.post(function(req,res){
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

		//Check given email for existance before trying to send
		console.log('Checking if '+req.body.email+' is valid...');

		emailExistence.check(req.body.email, function(err,response){
			//if there was an error notify user/set return message. Do not send email
			if(err){
				console.log("An error occurred while checking the email...");
				console.log(err);

				//Set header, content-type, and return message to client
				//res.header('Access-Control-Allow-Origin', "*") //Cross domain compatibility
	  			res.contentType('json');
	  			res.send(JSON.stringify({success:false}));
			}
			//if there was no error, check response... if true send email, if not alert user
			else{
				if(response==true){
					transporter.sendMail(mailOptions, function(error, info){
					    if(error){
					        console.log(error);

					        //Set header, content-type, and return message to client
							//res.header('Access-Control-Allow-Origin', "*") //Cross domain compatibility
	  						res.contentType('json');
	  						res.send(JSON.stringify({success:false}));
					    }
					    else{
					        console.log('Sending Message...');
					        console.log(info.response);

					        //Set header, content-type, and return message to client
							//res.header('Access-Control-Allow-Origin', "*") //Cross domain compatibility
	  						res.contentType('json');
	  						res.send(JSON.stringify({success:true}));
					    }
					});
				}
				else{
					console.log("The given email does not exist...");

					//Set header, content-type, and return message to client
					//res.header('Access-Control-Allow-Origin', "*") //Cross domain compatibility
	  				res.contentType('json');
	  				res.send(JSON.stringify({success:false}));
				}

				
			}
		});//end of post
	});//endof chained routes

/* == SERVER == */
var server = app.listen(PORT, function(){
	console.log('\nServer is up and running; listening on port '+server.address().port);
});

