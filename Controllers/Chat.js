const chatModal = require("../Models/Chat");
const {Op} = require('sequelize')
const {instrument} = require('@socket.io/admin-ui')
// const multer = require('multer');
const formidable = require("formidable");
const path = require('path');
const fs = require('fs');
const S3services = require('../services/S3services')

const io = require("socket.io")(5000, {
  cors:{
    origin: ["http://localhost:5173", "https://admin.socket.io"],
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

instrument(io , {auth:false})

// // Set up storage configuration for multer
// const storage = multer.diskStorage({
//   destination:(req, file , cb)=>{
//     cb(null , 'uploads/')
//   },
//   filename:(req, file , cb)=>{
//     cb(null , file.originalname);
//   }
// })

// // Initialize multer with the storage configuration
// const upload = multer({ storage })


// exports.AddData =async (req, res, next) => {


//   const userid = req.user.id;
//   const messagebody = req.body.message;
//   const groupid = req.body.groupid;


//   chatModal
//     .create({
//       message: messagebody,
//       userAuthDatumId: userid,
//       groupDatumGroupid:groupid
//     })
//     .then(() => {
//       res.status(200).json({ message: "message added to db" });
//     })
//     .catch((err) => {
//       res
//         .status(400)
//         .json({ message: "error during adding to db", error: err });
//     });
// };



exports.AddData = async (req, res, next) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ message: "Error parsing the files", error: err });
    }

    // console.log('Fields:', fields);
    // console.log('Uploaded file:', files.file);
    // console.log('file name ===>', files.file[0].originalFilename )
    // console.log('file path ===>', files.file[0].filepath )

    const messagebody = fields.message;
    const groupid = fields.groupid ? Number(fields.groupid) : null;  // Set to null if not provided
    const userid = req.user.id;

    // console.log('message body ', String(messagebody));
    // console.log('user id ', userid);
    // console.log('groupid', groupid);

    const chatData = {
      message:  String(messagebody),
      userAuthDatumId: userid
    }

    if(groupid){
      chatData.groupDatumGroupid = groupid;
    }

    if(files.file){
      //read they file content
      const fileContent = fs.readFileSync(String(files.file[0].filepath))
      const filename =   files.file[0].originalFilename
      const fileURl = await S3services.uploadtoS3(fileContent , filename)
      console.log('file url after uploaded to aws', fileURl)
      chatData.fileurl = fileURl;
      chatData.filename = filename
    }

    chatModal.create(chatData)
    .then(() => {
      res.status(200).json({ message: "Message and file uploaded successfully", file: files.file });
    })
    .catch((err) => {
      res.status(400).json({ message: "Error during adding to db", error: err });
      console.log(err)
    });
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
