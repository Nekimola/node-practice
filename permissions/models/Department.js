const mongoose = require('../lib/mongoose'),
  Schema = mongoose.Schema;

const DepartmentSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

exports.Department = mongoose.model('Department', DepartmentSchema);
