const express = require('express');
const candidateController = require(`./../controllers/candidateController`);
const authenticationController = require(`./../controllers/authenticationController`);

const router = express.Router();

router.route('/').get(authenticationController.protect, authenticationController.restrictTo('admin'), candidateController.getAllCandidates).post(authenticationController.protect, authenticationController.restrictTo('admin'), candidateController.createCandidate) 
router.route('/:id').get(authenticationController.protect, authenticationController.restrictTo('admin'), candidateController.getCandidate).delete(authenticationController.protect, authenticationController.restrictTo('admin'), candidateController.deleteCandidate).patch(authenticationController.protect, authenticationController.restrictTo('admin'), candidateController.updateCandidate)

module.exports = router
