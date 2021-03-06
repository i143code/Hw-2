var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;
var xml2js = require ('xml2js')
var fs = require ('fs')
var parser = new xml2js.Parser();

var CONTACTS_COLLECTION = "contacts";


var app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname + "/static"));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
// Create a database variable outside of the database
var db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect("mongodb://ashish:ashish@ds143717.mlab.com:43717/multivision", function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  db = database;
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

//home routes

app.get('/',function(req,res){
 res.send("Welcome to Rest API by Ashish Ranjan. Please naviagte to  https://pacific-inlet-58514.herokuapp.com/contacts")

})

app.get("/contacts", function(req, res) {
  db.collection(CONTACTS_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get contacts.");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.post("/contacts", function(req, res) {
  var newContact = req.body;
  newContact.createDate = new Date();

  if (!(req.body.firstName || req.body.lastName)) {
    handleError(res, "Invalid user input", "Must provide a first or last name.", 400);
  }

  db.collection(CONTACTS_COLLECTION).insertOne(newContact, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new contact.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});

app.get("/contacts/:id", function(req, res) {
  db.collection(CONTACTS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get contact");
    } else {
      res.status(200).json(doc);
    }
  });
});


app.get('/api/rsdl1',function(req,res){
//   fs.readFile(__dirname + '/RSDL.xml', 'utf8', function(err, data) {
//     if (!err) {
//         // res.status(200).json(data);
//         res.send(__dirname + '/RSDL.xml')
//     }
// });
res.sendfile(__dirname + '/RSDL.xml')
})


//adding wsdl
app.get("/api/rsdl",function(req,res){
  var returnJSONResults = function(baseName, queryName) {
     var XMLPath = "RSDL.xml";
     var rawJSON = loadXMLDoc(XMLPath);
    function loadXMLDoc(filePath) {
        var fs = require('fs');
        var xml2js = require('xml2js');
        var json;
        try {
            var fileData = fs.readFileSync(filePath, 'ascii');

            var parser = new xml2js.Parser();
            parser.parseString(fileData.substring(0, fileData.length), function (err, result) {
            json = JSON.stringify(result);
            res.status(200).json(JSON.stringify(result));
        });

        res.status(200).json("File '" + filePath + "/ was successfully read.\n");
        res.status(200).json
        return json;
    } catch (ex) {console.log(ex)}
 }
}();
})

app.put("/contacts/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(CONTACTS_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update contact");
    } else {
      res.status(204).end();
    }
  });
});

app.delete("/contacts/:id", function(req, res) {
  db.collection(CONTACTS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete contact");
    } else {
      res.status(204).end();
    }
  });
});
