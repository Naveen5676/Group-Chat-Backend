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
  socket.on("joinGroup", (id) => {
    socket.join(`group_${id}`);
    //console.log(`User joined group: ${id}`);
  });

  // Listen for getChats event to fetch messages
  socket.on("getChats", async (latestmessageId, id) => {
    try {
      let chatData = [];
      if (id > 0) {
        // Group-specific chat
        chatData = await chatModal.findAll({
          where: { id: { [Op.gt]: latestmessageId }, groupDatumId: id }
        });
        //console.log('group message chat', chatData);
        socket.emit('groupmessagedata', chatData); // Emit only to the specific group
      } else {
        // Public chat
        chatData = await chatModal.findAll({
          where: { id: { [Op.gt]: latestmessageId }, groupDatumId: null }
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
    console.log("Files:", files);

    const messagebody = fields.message;
    const id = fields.groupid ? Number(fields.groupid) : null;
    const userid = req.user.id;

    const chatData = {
      message: String(messagebody),
      userAuthDatumId: userid
    };

    if (id) {
      chatData.groupDatumId = id;
    }

    if (files.file) {
      const fileContent = fs.readFileSync(String(files.file[0].filepath));
      const filename = files.file[0].originalFilename;
      const fileURl = await S3services.uploadtoS3(fileContent, filename);
      chatData.fileUrl = fileURl;
      chatData.fileName = filename;
    }

    try {
      const newMessage = await chatModal.create(chatData);
      res.status(200).json({ message: "Message and file uploaded successfully", file: files.file });

      // Emit the new message to all clients in the relevant room
      if (id) {
        const chatData = await chatModal.findAll({
          where: { groupDatumId: id }
        });
        io.to(`group_${id}`).emit('groupmessagedata', chatData);
      } else {
        const chatData = await chatModal.findAll({
          where: { groupDatumId: null }
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
    const id = req.query.id;
    if (id > 0) {
      const groupmessagedata = await chatModal.findAll({
        where: { id: { [Op.gt]: latestmessageId }, groupDatumId: id }
      });
      res.status(200).json(groupmessagedata);
    } else {
      const messageData = await chatModal.findAll({
        where: { id: { [Op.gt]: latestmessageId }, groupDatumId: null }
      });
      if (messageData) {
        res.status(200).json(messageData);
      }
    }
  } catch (error) {
    console.log(error);
  }
};
