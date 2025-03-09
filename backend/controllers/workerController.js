const Worker = require('../models/Worker');
const { validationResult } = require('express-validator');

/**
 * @desc    Get all workers
 * @route   GET /api/workers
 * @access  Public
 */
exports.getWorkers = async (req, res) => {
  try {
    const workers = await Worker.find();
    
    // Return just the array for simpler frontend integration
    res.status(200).json(workers);
  } catch (error) {
    console.error(`Error fetching workers: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Get single worker
 * @route   GET /api/workers/:id
 * @access  Public
 */
exports.getWorker = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      return res.status(404).json({
        success: false,
        error: 'Worker not found'
      });
    }

    res.status(200).json(worker);
  } catch (error) {
    console.error(`Error fetching worker: ${error.message}`);
    
    // Check if error is a valid ObjectId error
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Worker not found'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Create new worker
 * @route   POST /api/workers
 * @access  Public
 */
exports.createWorker = async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const worker = await Worker.create(req.body);

    res.status(201).json({
      success: true,
      data: worker
    });
  } catch (error) {
    console.error(`Error creating worker: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Update worker
 * @route   PUT /api/workers/:id
 * @access  Public
 */
exports.updateWorker = async (req, res) => {
  try {
    let worker = await Worker.findById(req.params.id);

    if (!worker) {
      return res.status(404).json({
        success: false,
        error: 'Worker not found'
      });
    }

    worker = await Worker.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('assignedMachines', 'name type status');

    res.status(200).json({
      success: true,
      data: worker
    });
  } catch (error) {
    console.error(`Error updating worker: ${error.message}`);
    
    // Check if error is a valid ObjectId error
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Worker not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Delete worker
 * @route   DELETE /api/workers/:id
 * @access  Public
 */
exports.deleteWorker = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      return res.status(404).json({
        success: false,
        error: 'Worker not found'
      });
    }

    await worker.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(`Error deleting worker: ${error.message}`);
    
    // Check if error is a valid ObjectId error
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Worker not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}; 