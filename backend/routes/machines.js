const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const {
  getMachines,
  getMachine,
  createMachine,
  updateMachine,
  deleteMachine
} = require('../controllers/machineController');

// Validation middleware
const validateMachineInput = [
  check('name', 'Name is required').not().isEmpty(),
  check('type', 'Type is required').not().isEmpty(),
  check('status', 'Status must be operational, maintenance, or offline')
    .optional()
    .isIn(['operational', 'maintenance', 'offline'])
];

// Routes
router.route('/')
  .get(getMachines)
  .post(validateMachineInput, createMachine);

router.route('/:id')
  .get(getMachine)
  .put(updateMachine)
  .delete(deleteMachine);

module.exports = router; 