var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var tvshowSchema = new Schema({
  title:    { type: String },
  href:     { type: String },   
  poster:   { type: String }   
});

module.exports = mongoose.model('TVShow', tvshowSchema);