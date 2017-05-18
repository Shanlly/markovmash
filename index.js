// express server app set up


var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs= require('fs');

// twitter library
var Twitter= require('twitter');
// secert app keys
var secret= require('./secret.js');

//putting lib and keys together
var client = new Twitter(secret);

//pulling in markvo file
var markov = require("./markov.js");

//pulling in the haiku module
var Haiku = require("random-haiku");
var haiku = new Haiku();


app.use(bodyParser.urlencoded({
   extended: true
}));
app.use(bodyParser.json());

// middlewear added 
/*transparent function ...
 the next lets it be funneled down thru the rest of the middlewear
*/
app.use(function(req, res, next){
	console.log('line 35', req.url);
	next();
});

// it pulls information for two user mashup
app.get("/api/tweets/mash", function(req, res){
	var user = req.query.user;
	var user2= req.query.user2;

//setting what I wanted from twitter
	var params1 ={
		screen_name: user,
		include_rts: false,
		count: 200,
		contributor_details:false,
		trim_user: true
	};
	var params2={
		screen_name: user2,
		include_rts: false,
		count: 200,
		contributor_details:false,
		trim_user: true
	};
// dealing with errors
	if(! user || ! user2){
		res.send("Oh no there was no user names!");
	}
// pulling information from twitter for the two user mash up 
	client.get('statuses/user_timeline', params1, function(error, tweets, response) {
		if (!error) {
			tweets = (tweets.map(function(tweet){
				return tweet.text;
			}));
			for(var i = 0; i < tweets.length; i++){
				markov.train(tweets[i]);
			}
		}
		client.get('statuses/user_timeline', params2, function(error, tweets, response){
			if (!error) {
				tweets = (tweets.map(function(tweet){
					return tweet.text;
				}));
				for(var i=0; i<tweets.length;i++){
					markov.train(tweets[i]);
				}
					res.send(markov.generate(140));
			}else {
				console.log(error);
				res.send("oops there was an error");
			}
			markov.reset();
		});
	});
});

// get request for the markvo tweet
app.get("/api/tweet", function(req, res ){
	var user = req.query.user;
	var params ={
		screen_name: user,
		include_rts: false,
		count: 200,
		contributor_details:false,
		trim_user: true
	};
// pulling information from twitter for user mash up
	client.get('statuses/user_timeline', params, function(error, tweets, response) {
		if (!error) {
			tweets = tweets.map(function(tweet) {
			return tweet.text;
			});
		}
		if("#tweet"){
			for(var i=0; i<tweets.length;i++){
				markov.train(tweets[i]);
			}
				res.send(markov.generate(140));
				markov.reset();
		}else {
			console.log(tweets);
			res.send("oops there was an error");
		}
	});
});


// get request for the haiku 
app.get("/api/haiku", function(req, res ){
	var user = req.query.user;
	var params ={
		screen_name: user,
		include_rts: false,
		count: 200,
		contributor_details:false,
		trim_user: true
	};
	client.get('statuses/user_timeline', params, function(error, tweets, response) {
		if (!error) {
			tweets = tweets.map(function(tweet) {
			return tweet.text;
			});
			haiku.addToDataset(tweets.join(' '), function(err, resp){
				if(err){
					console.log(err);
				}
				res.send(haiku.generate());
				haiku.clear();
			});
		}else {
			console.log(tweetsmash);
			res.send("oops there was an error");
		}
	});
});


app.use(express.static("public"));

// handles 404 errs
app.use(function(req,res,next){
	res.status(404);
	res.send("404 File Not Found!");
	next();
});
// handles 500 errs
app.use(function(err,req, res, next){
	console.log(err);
	res.status(500);
	res.send("500 Internal Server Error");
});


app.listen(8080, function (){
	console.log("Server started : http://localhost:8080");
});