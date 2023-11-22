const express = require('express');
const votingController = require(`./../controllers/votingController`);
const userController = require(`./../controllers/userController`);
const authenticationController = require(`./../controllers/authenticationController`);

const router = express.Router();

router.route('/').post(userController.uploadUserPhoto, votingController.vote)

module.exports = router
