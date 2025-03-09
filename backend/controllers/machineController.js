const Machine = require('../models/Machine');
const { validationResult } = require('express-validator');

/**
 * @desc    Get all machines
 * @route   GET /api/machines
 * @access  Public
 */
exports.getMachines = async (req, res) => {
  try {
    const machines = await Machine.find();
    
    // Return just the array for simpler frontend integration
    res.status(200).json(machines);
  } catch (error) {
    console.error(`Error fetching machines: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Get single machine
 * @route   GET /api/machines/:id
 * @access  Public
 */
exports.getMachine = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);

    if (!machine) {
      return res.status(404).json({
        success: false,
        error: 'Machine not found'
      });
    }

    res.status(200).json(machine);
  } catch (error) {
    console.error(`Error fetching machine: ${error.message}`);
    
    // Check if error is a valid ObjectId error
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Machine not found'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Create new machine
 * @route   POST /api/machines
 * @access  Public
 */
exports.createMachine = async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const machine = await Machine.create(req.body);

    res.status(201).json({
      success: true,
      data: machine
    });
  } catch (error) {
    console.error(`Error creating machine: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Update machine
 * @route   PUT /api/machines/:id
 * @access  Public
 */
exports.updateMachine = async (req, res) => {
  try {
    let machine = await Machine.findById(req.params.id);

    if (!machine) {
      return res.status(404).json({
        success: false,
        error: 'Machine not found'
      });
    }

    machine = await Machine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('assignedWorker', 'name specialty');

    res.status(200).json({
      success: true,
      data: machine
    });
  } catch (error) {
    console.error(`Error updating machine: ${error.message}`);
    
    // Check if error is a valid ObjectId error
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Machine not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Delete machine
 * @route   DELETE /api/machines/:id
 * @access  Public
 */
exports.deleteMachine = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);

    if (!machine) {
      return res.status(404).json({
        success: false,
        error: 'Machine not found'
      });
    }

    await machine.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(`Error deleting machine: ${error.message}`);
    
    // Check if error is a valid ObjectId error
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Machine not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}; 