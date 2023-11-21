const express = require('express');
const electionController = require(`./../controllers/electionController`);
const authenticationController = require(`./../controllers/authenticationController`);

const router = express.Router();
router.route('/').get(authenticationController.protect, authenticationController.restrictTo('admin'), electionController.getAllElections).post(authenticationController.protect, authenticationController.restrictTo('admin'), electionController.createElection) 
router.route('/:id').get(authenticationController.protect, authenticationController.restrictTo('admin'), electionController.getElection).delete(authenticationController.protect, authenticationController.restrictTo('admin'), electionController.deleteElection).patch(authenticationController.protect, authenticationController.restrictTo('admin'), electionController.updateElection)
module.exports = router

