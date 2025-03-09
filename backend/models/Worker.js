const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Worker Schema
 * Represents a worker in the industrial setting
 */
const WorkerSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Worker name is required'],
    trim: true
  },
  specialty: {
    type: String,
    required: [true, 'Worker specialty is required'],
    trim: true
  },
  assignedMachines: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Worker', WorkerSchema); 