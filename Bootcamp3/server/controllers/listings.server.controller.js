
/* Dependencies */
var mongoose = require('mongoose'), 
    Listing = require('../models/listings.server.model.js'),
    coordinates = require('./coordinates.server.controller.js'),
    util = require('util');
    
/* Create a listing */
exports.create = function(req, res) {

  /* Instantiate a Listing */
  var listing = new Listing(req.body);
  console.log("TESTSTTT21     " + JSON.stringify(req.results));
  /* save the coordinates (located in req.results if there is an address property) */
  if(req.results) {
    console.log("TESTSTTT22     " + JSON.stringify(req.results));
    listing.coordinates = {
      latitude: req.results.lat, 
      longitude: req.results.lng
    };
  }
 
  /* Then save the listing */
  listing.save(function(err) {
    if(err) {
      console.log(err);
      res.status(400).send(err);
    } else {
      console.log(listing);
      res.json(listing);
    }
  });
};

/* Show the current listing */
exports.read = function(req, res) {
  /* send back the listing as json from the request */
  res.json(req.listing);
};

/* Update a listing - note the order in which this function is called by the router*/
exports.update = function(req, res) {
  var listing = req.listing;
  var bodyListing = new Listing(req.body);
  var query = {code : listing.code};
  var update = {
    name : bodyListing.name,
    code : bodyListing.code,
    address : bodyListing.address
  };

  if(req.results) {
    bodyListing.coordinates = {
      latitude: req.results.lat, 
      longitude: req.results.lng
    };
    update.coordinates = bodyListing.coordinates;
  }

  Listing.updateOne(query,update, 
    function (err, result) {
        if (err) throw err;
    });

  Listing.findOne({code: bodyListing.code})
  .then(result => { 
    res.send(result);
  }).catch(err => {
    res.status(400).send({
        message: err.message || "Failed to update location"
    });
  });
};

/* Delete a listing */
exports.delete = function(req, res) {
  var listing = req.listing;

  Listing.deleteOne({
    code: listing.code
  }, function (err, result) {
    if (err)
        res.send(err);
    res.json({
        status: "success",
        message: 'Listing deleted'
    });
  });

};

/* Retreive all the directory listings, sorted alphabetically by listing code */
exports.list = function(req, res) {
  /* Add your code */

  Listing.find({}, function(err, locations) {
    if (err) throw err;
    
    //Sorts it alphabetically by code
    locations.sort( (a,b) => (a.code > b.code) ? 1 : -1);

    // object of all the users
    //console.log(util.inspect(locations, {maxArrayLength: null}));
    
  }).then(locations => { 
    res.send(locations);
  }).catch(err => {
    res.status(400).send({
        message: err.message || "Some error occurred while retrieving locations."
    });
  });
};

/* 
  Middleware: find a listing by its ID, then pass it to the next request handler. 

  HINT: Find the listing using a mongoose query, 
        bind it to the request object as the property 'listing', 
        then finally call next
 */
exports.listingByID = function(req, res, next, id) {
  Listing.findById(id).exec(function(err, listing) {
    //coordinates.use(req,res,next, function(req) {

    //});
    if(err) {
      res.status(400).send(err);
    } else {
      req.listing = listing;
      next();
    }
  });
};