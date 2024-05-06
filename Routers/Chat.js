const chatController  = require('../Controllers/Chat')
const authorizationMiddleware = require('../Middleware/Authorization')
const express = require('express');

const router = express.Router();

router.post('/sendchat' , authorizationMiddleware.authorization , chatController.AddData )

module.exports = router