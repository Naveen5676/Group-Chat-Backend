const chatModal = require("../Models/Chat");
const {Op} = require('sequelize')

const io = require("socket.io")(5000, {
  cors:{
    origin: "http://localhost:5173",
    methods:["GET", "POST"],
    credentials: true,
    allowedHeaders:["my-custom-header"]
  }
})

io.on("connection" , (socket)=>{
  socket.on("getChats", async(latestmessageId , groupid )=>{
    try{
      if(groupid>0){
        const groupmessagedata = await  chatModal.findAll({where : { id :{[Op.gt]: latestmessageId} , groupDatumGroupid : groupid}})
        io.emit('groupmessagedata', groupmessagedata)
     }else{
      const messageData = await chatModal.findAll({where : { id :{ [Op.gt]: latestmessageId} , groupDatumGroupid: null}});
      //console.log('message data ============>>>>>>>>>>',messageData)
      if (messageData) {
        io.emit('groupmessagedata', messageData)
      }
    }

    }catch(error){
      console.log(error)
    }
  })
})

exports.AddData = async (req, res, next) => {
  const userid = req.user.id;
  const messagebody = req.body.message;
  const groupid = req.body.groupid

  chatModal
    .create({
      message: messagebody,
      userAuthDatumId: userid,
      groupDatumGroupid:groupid
    })
    .then(() => {
      res.status(200).json({ message: "message added to db" });
    })
    .catch((err) => {
      res
        .status(400)
        .json({ message: "error during adding to db", error: err });
    });
};

exports.sendChatData = async (req, res, next) => {
  try {
    const latestmessageId = req.query.latestmessageId;
    console.log('latestmessage id ', latestmessageId)
    const groupid = req.query.groupid
    console.log('group id ', groupid)
    if(groupid>0){
       const groupmessagedata = await  chatModal.findAll({where : { id :{[Op.gt]: latestmessageId} , groupDatumGroupid : groupid}})
       res.status(200).json(groupmessagedata)
    }else{
      const messageData = await chatModal.findAll({where : { id :{ [Op.gt]: latestmessageId} , groupDatumGroupid: null}});
      //console.log('message data ============>>>>>>>>>>',messageData)
      if (messageData) {
        res.status(200).json(messageData);
      }
    }
    // const messageData = await chatModal.findAll({where : { id :{ [Op.gt]: latestmessageId}}});
    // //console.log('message data ============>>>>>>>>>>',messageData)
    // if (messageData) {
    //   res.status(200).json(messageData);
    // }
  } catch (error) {
    console.log(error)
  }
};
