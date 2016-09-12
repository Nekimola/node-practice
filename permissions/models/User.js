// var crypto = require('crypto');
// var async = require('async');
// var util = require('util');

const mongoose = require('lib/mongoose'),
  Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department'
  },
  role: {
    type: String,
    required: true,
  }
});

exports.User = mongoose.model('User', UserSchema);
