const TWILIO_ACCOUNT_SID = 'AC17533ba1249099bfff0e2f8237df7699';
const TWILIO_API_KEY = 'SK7bbbdfc5994d3cfa6295023a2efdc3ba';
const TWILIO_API_SECRET = '6qKncYGHZVLKHAylj7SwM6JBRIQx49ga';


require('dotenv').load();

var http = require('http');
var AccessToken = require('twilio').jwt.AccessToken;
var VideoGrant = AccessToken.VideoGrant;
var express = require('express');

// Create Express webapp.
var app = express();

/**
 * Generate an Access Token for a chat application user provided via the url
 */
app.get('/token', function(request, response) {
  response.header('Access-Control-Allow-Origin', '*');
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
 
  var identity = request.query['identity'];

  if ( !identity ) {
    response.send({
      body: "An identity is needed"
    })
  }

  // Create an access token which we will sign and return to the client,
  // containing the grant we just created.
  var token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET
  );

  // Assign the generated identity to the token.
  token.identity = identity;

  // Grant the access token Twilio Video capabilities.
  var grant = new VideoGrant();
  token.addGrant(grant);

  // Serialize the token to a JWT string and include it in a JSON response.
  response.send({
    identity: identity,
    token: token.toJwt()
  });
});