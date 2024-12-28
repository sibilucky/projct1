var express = require('express');
var path = require('path');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var app = express();

// Middleware to parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve the index.html file when the root route is accessed
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Serve profile image
app.get('/profile-picture', function (req, res) {
  var img = fs.readFileSync('/home/app/images/profile-1.jpg');
  res.writeHead(200, {'Content-Type': 'image/jpg' });
  res.end(img, 'binary');
});

// Handle profile update from POST request
app.post('/update-profile', function (req, res) {
  var userObj = req.body;

  MongoClient.connect("mongodb://admin:password@mongodb", function (err, client) {
    if (err) throw err;

    var db = client.db('my-db');
    userObj['userid'] = 1;  // Assuming you are updating for the user with userid=1

    var myquery = { userid: 1 };
    var newvalues = { $set: userObj };

    db.collection("users").updateOne(myquery, newvalues, { upsert: true }, function (err, result) {
      if (err) throw err;
      client.close();
      res.send({ success: true, message: 'Profile updated successfully' });
    });
  });
});

// Handle getting profile information
app.get('/get-profile', function (req, res) {
  var response = {};

  MongoClient.connect("mongodb://admin:password@mongodb", function (err, client) {
    if (err) throw err;

    var db = client.db('my-db');

    var myquery = { userid: 1 };

    db.collection("users").findOne(myquery, function (err, result) {
      if (err) throw err;
      client.close();

      if (result) {
        res.send(result);  // Send the user profile if found
      } else {
        res.status(404).send({ success: false, message: 'Profile not found' });
      }
    });
  });
});

// Start the Express server
app.listen(3000, function () {
  console.log('Server is running on port 3000');
});

