const chatModal = require("../Models/Chat");
const { Op } = require('sequelize');
const { instrument } = require('@socket.io/admin-ui');
const formidable = require("formidable");
const path = require('path');
const fs = require('fs');
const S3services = require('../services/S3services');

const io = require("socket.io")(5000, {
  cors: {
    origin: ["http://localhost:5173", "https://admin.socket.io"],
  }
});

io.on("connection", (socket) => {
  //console.log("A user connected");

  // When a user wants to join public chat
  socket.on("joinPublic", () => {
    socket.join("public");
    //console.log("User joined public chat");
  });

  // When a user selects a group, they join that group's room
  socket.on("joinGroup", (groupid) => {
    socket.join(`group_${groupid}`);
    //console.log(`User joined group: ${groupid}`);
  });

  // Listen for getChats event to fetch messages
  socket.on("getChats", async (latestmessageId, groupid) => {
    try {
      let chatData = [];
      if (groupid > 0) {
        // Group-specific chat
        chatData = await chatModal.findAll({
          where: { id: { [Op.gt]: latestmessageId }, groupDatumGroupid: groupid }
        });
        //console.log('group message chat', chatData);
        socket.emit('groupmessagedata', chatData); // Emit only to the specific group
      } else {
        // Public chat
        chatData = await chatModal.findAll({
          where: { id: { [Op.gt]: latestmessageId }, groupDatumGroupid: null }
        });
        //console.log('public message chat', chatData);
        socket.emit('publicmessagedata', chatData); // Emit only to the public chat
      }
    } catch (error) {
      console.log(error);
    }
  });
});

// Handle new message addition
exports.AddData = async (req, res, next) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ message: "Error parsing the files", error: err });
    }

    const messagebody = fields.message;
    const groupid = fields.groupid ? Number(fields.groupid) : null;
    const userid = req.user.id;

    const chatData = {
      message: String(messagebody),
      userAuthDatumId: userid
    };

    if (groupid) {
      chatData.groupDatumGroupid = groupid;
    }

    if (files.file) {
      const fileContent = fs.readFileSync(String(files.file[0].filepath));
      const filename = files.file[0].originalFilename;
      const fileURl = await S3services.uploadtoS3(fileContent, filename);
      chatData.fileurl = fileURl;
      chatData.filename = filename;
    }

    try {
      const newMessage = await chatModal.create(chatData);
      res.status(200).json({ message: "Message and file uploaded successfully", file: files.file });

      // Emit the new message to all clients in the relevant room
      if (groupid) {
        const chatData = await chatModal.findAll({
          where: { groupDatumGroupid: groupid }
        });
        io.to(`group_${groupid}`).emit('groupmessagedata', chatData);
      } else {
        const chatData = await chatModal.findAll({
          where: { groupDatumGroupid: null }
        });
        io.to("public").emit('publicmessagedata', chatData);
      }
    } catch (err) {
      res.status(400).json({ message: "Error during adding to db", error: err });
      console.log(err);
    }
  });
};

exports.sendChatData = async (req, res, next) => {
  try {
    const latestmessageId = req.query.latestmessageId;
    const groupid = req.query.groupid;
    if (groupid > 0) {
      const groupmessagedata = await chatModal.findAll({
        where: { id: { [Op.gt]: latestmessageId }, groupDatumGroupid: groupid }
      });
      res.status(200).json(groupmessagedata);
    } else {
      const messageData = await chatModal.findAll({
        where: { id: { [Op.gt]: latestmessageId }, groupDatumGroupid: null }
      });
      if (messageData) {
        res.status(200).json(messageData);
      }
    }
  } catch (error) {
    console.log(error);
  }
};
