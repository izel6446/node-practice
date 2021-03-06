const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  userid: {type:String, unique: true},
  age: String,
  sex: String,
  region: String
},{
  // Auto gen 'createAt' and 'updateAt'
  timestamps:true
});

userSchema.index({userid:1});

module.exports = mongoose.model('user', userSchema);