const chatModal = require('../Models/Chat')

exports.AddData = async (req,res,next)=>{
    const userid = req.user.id
    const messagebody = req.body.message

    chatModal.create({
        message:messagebody,
        userAuthDatumId:userid
    }).then(()=>{
        res.status(200).json({message: 'message added to db'})
    }).catch((err)=>{
        res.status(400).json({message:'error during adding to db', error:err})
    })
    
}

exports.sendChatData = async(req,res,next)=>{
try{    const messageData =await  chatModal.findAll()
    //console.log('message data ============>>>>>>>>>>',messageData)
    if(messageData){
        res.status(200).json(messageData)
    }}
    catch(error){

    }
}