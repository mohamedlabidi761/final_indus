const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const {
  getWorkers,
  getWorker,
  createWorker,
  updateWorker,
  deleteWorker
} = require('../controllers/workerController');

// Validation middleware
const validateWorkerInput = [
  check('name', 'Name is required').not().isEmpty(),
  check('specialty', 'Specialty is required').not().isEmpty()
];

// Routes
router.route('/')
  .get(getWorkers)
  .post(validateWorkerInput, createWorker);

router.route('/:id')
  .get(getWorker)
  .put(updateWorker)
  .delete(deleteWorker);

module.exports = router; 