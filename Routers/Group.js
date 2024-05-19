const groupController = require('../Controllers/Group')
const authorizationMiddleware = require('../Middleware/Authorization')
const express= require('express')

const router = express.Router()

router.post('/creatgroup', authorizationMiddleware.authorization , groupController.createGroup)
router.get('/getgrouplist', groupController.showallGroup)
router.post('/checkuserpresentingroup' , authorizationMiddleware.authorization , groupController.userPresentInGroup)
router.post('/joingroup', authorizationMiddleware.authorization , groupController.joinGroup)

module.exports = router

