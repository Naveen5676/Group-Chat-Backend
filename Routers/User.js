const e = require('cors')
const userController = require('../Controllers/User')
const express = require('express')

const router = express.Router()

router.post('/signup' , userController.Signup);
router.post('/login' , userController.Login)
module.exports = router