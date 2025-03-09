const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Machine Schema
 * Represents a machine in the industrial setting
 */
const MachineSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Machine name is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Machine type is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['operational', 'maintenance', 'offline'],
    default: 'operational'
  },
  assignedWorker: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Machine', MachineSchema); 