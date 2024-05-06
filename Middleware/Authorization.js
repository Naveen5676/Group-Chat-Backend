const jwt = require('jsonwebtoken');
const userModal = require('../Models/User');

exports.authorization = (req,res,next)=>{
    //get tiken form header
    const token = req.header('Authorization');
    const user = jwt.verify(token , '564894165489465asdfsa48949848564sa98df985sa456498asdf' )
    userModal.findByPk(user.userId).then((user)=>{
        if(!user){
            res.status(500).json({message:"user not found"})
        }
        //sending user data of that userid in req.user
        req.user = user
        next();
    }).catch((err)=>{
        res.status(401).json({message : 'Auth Failed!' , error: err})
    })
}