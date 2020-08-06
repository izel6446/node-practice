const mongoose = require('mongoose');
const { ObjectId } = require('mongoose');
const Schema = mongoose.Schema;

const accessSchema = new Schema({
  timestamp: { type: Date, default: Date.now  },
  user: {type:ObjectId, ref: 'user'},
  board: String,
  geo: String,
  agent: new Schema({
    os: String,
    platform: String,
    browser:  String,
    version:  String
  })
});

module.exports = mongoose.model('access', accessSchema);