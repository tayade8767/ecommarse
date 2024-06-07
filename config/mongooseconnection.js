const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/ecommerse")
.then(function() {
    console.log("Connected");
})
.catch(function(err) {
    console.log("Error: " + err);
})

module.exports = mongoose.connection;