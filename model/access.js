const mongoose = require('mongoose');
const { ObjectId } = require('mongoose');
const Schema = mongoose.Schema;

const accessSchema = new Schema({
  timestamp: { type: Date },
  user: {type:ObjectId, ref: 'user'},
  board: String,
  client: new Schema({
    geo: String,
    ip: String
  }),
  agent: new Schema({
    os: String,
    platform: String,
    browser:  String,
    version:  String
  })
});

accessSchema.index({timestamp:-1});

module.exports = mongoose.model('access', accessSchema);