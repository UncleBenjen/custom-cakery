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
	//var successMessage = null;


	//Check given email for existance before trying to send
	console.log('Checking if '+req.body.email+' is valid...');
	
	

	//original implementation; after discovering the bug was in email-existence module it may be that this implementation still works
	/*
	emailExistence.check(req.body.email, function(err,response){
		//if there was an error notify user/set return message. Do not send email
		if(err){
			console.log("An error occurred while checking the email...");
			console.log(err);
			var successMessage=false;

			//Set header, content-type, and return message to client
			res.header('Access-Control-Allow-Origin', "*") //Cross domain compatibility
  			res.contentType('json');
  			res.send(JSON.stringify({message:successMessage}));
		}
		//if there was no error, check response... if true send email, if not alert user
		else{
			if(response==true){
				transporter.sendMail(mailOptions, function(error, info){
				    if(error){
				        console.log(error);
				        var successMessage = false;

				        //Set header, content-type, and return message to client
						res.header('Access-Control-Allow-Origin', "*") //Cross domain compatibility
  						res.contentType('json');
  						res.send(JSON.stringify({message:successMessage}));
				    }
				    else{
				        console.log('Sending Message...');
				        console.log(info.response);

				        var successMessage = true;

				        //Set header, content-type, and return message to client
						res.header('Access-Control-Allow-Origin', "*") //Cross domain compatibility
  						res.contentType('json');
  						res.send(JSON.stringify({message:successMessage}));
				    }
				});
			}
			else{
				console.log("The given email does not exist...");
				var successMessage=false;

				//Set header, content-type, and return message to client
				res.header('Access-Control-Allow-Origin', "*") //Cross domain compatibility
  				res.contentType('json');
  				res.send(JSON.stringify({message:successMessage}));
			}

			
		}
	});*/
	
	checkEmail(req.body.email, function(data, err){

		if(err){
			console.log("Error returned from check mail function...");

			res.header('Access-Control-Allow-Origin', "*") //Cross domain compatibility
  			res.contentType('json');
  			res.send(JSON.stringify({message:false}));
		}
		else if(data == true){
			transporter.sendMail(mailOptions, function(error, info){
				    if(error){
				        console.log(error);

				        res.header('Access-Control-Allow-Origin', "*") //Cross domain compatibility
  						res.contentType('json');
  						res.send(JSON.stringify({message:false}));
				    }
				    else{
				        console.log('Sending Message...');
				        console.log(info.response);

				        res.header('Access-Control-Allow-Origin', "*") //Cross domain compatibility
  						res.contentType('json');
  						res.send(JSON.stringify({message:true}));
				    }
			});
		}
		else{
			console.log("The given email does not exist.");

			res.header('Access-Control-Allow-Origin', "*") //Cross domain compatibility
  			res.contentType('json');
  			res.send(JSON.stringify({message:false}));
		}

		
	});//end of check email and callback

});

/* == SERVER == */
http.createServer(app).listen(app.get('port'), function(){
	console.log('Server is up and running; listening on port '+app.get('port'));
});

/* == VARIOUS FUNCTIONS == */
//Function to check email; accepts an email and a callback function
var checkEmail = function(email, callback){
	var successMessage = false;

	emailExistence.check(email, function(err,response){
		//if there was an error notify user/set return message. Do not send email
		if(err){
			console.log("An error occurred while checking the email...");
			console.log(err);
			successMessage=false;

		}
		//if there was no error, check response... if true send email, if not alert user
		else{
			if(response==true){
				successMessage=true;
			}
			else{
				console.log("The given email does not exist...");
				successMessage=false;
			}

			
		}

		callback(successMessage, err);

	});
}

