const groupModal = require("../Models/Group");
const userGroupModal = require('../Models/userGroup');
const User = require('../Models/User');
const { all } = require("../Routers/Group");
const userModal = require("../Models/User");
const S3services = require('../services/S3services');
const formidable = require('formidable');
const fs = require('fs');

exports.createGroup = async (req, res, next) => {
  const form = new formidable.IncomingForm();
  //console.log('Incommign form data ==>',form)

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ message: "Error parsing the files", error: err });
    }

    const groupname = fields.groupname;
    const userid = req.user.id;
    const groupdata = {
      name: String(groupname),
      adminId: userid
    };

    //console.log("Fields:", fields);
    //console.log("Files:", files);

    if (files.groupimage) {
      try {
        const filePath = files.groupimage[0].filepath;
        const originalFilename = files.groupimage[0].originalFilename;

        //console.log("File Path:", filePath);
        //console.log("Original Filename:", originalFilename);

        const fileContent = fs.readFileSync(filePath);
        const fileURL = await S3services.uploadtoS3(fileContent, originalFilename);

        //console.log("File URL============>", fileURL);

        groupdata.imageUrl = fileURL;
     
      } catch (fileError) {
        console.error("File handling error:", fileError);
        return res.status(500).json({ message: "Error handling file upload", error: fileError });
      }
    }

    try {
      const group = await groupModal.create(groupdata);

      console.log('group ===>>', group.dataValues);
      const userGroup = await userGroupModal.create({
        userAuthDatumId: userid,
        groupDatumId: group.dataValues.id
      });

      const createdgroupsuccessfully = await Promise.all([group, userGroup]);
      if (createdgroupsuccessfully) {
        res.status(201).json({ message: "Successfully added group" });
      } else {
        throw new Error("Something went wrong");
      }
    } catch (error) {
      res.status(400).json(error);
      console.log(error);
    }
  });
};

exports.showallGroup = async (req, res, next) => {
  try {
    const groupname = await groupModal.findAll();
    if (groupname) {
      res.status(200).json(groupname);
    }
  } catch (error) {
    res.status(400).json(error);
    console.log(error);
  }
};

exports.joinGroup = async (req, res, next) => {
  try {
    const { groupid } = req.body;
    const user = req.user;

    //console.log('group id ', groupid)
    const group = await groupModal.findByPk(groupid);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    await userGroupModal.create({
      userAuthDatumId: user.id,
      groupDatumId: groupid,
    });

    res.status(200).json({ message: "Successfully joined group" });
  } catch (error) {
    res.status(400).json(error);
    console.log(error);
  }
};


exports.userPresentInGroup=async(req,res,next)=>{
  try {
    const { groupid } = req.body;
    const userid = req.user.id
    const userinfo = req.user
    //console.log('id====>' , groupid)
    const groupDetails = await groupModal.findOne({where: { id : groupid}})
    const group = await userGroupModal.findOne({where : {userAuthDatumId: userid , groupDatumId:groupid}});
    console.log('group ==>>', group)
    const totalgroupmembers = await userGroupModal.findAll({where : {groupDatumId:groupid}})
    console.log('total count' , totalgroupmembers.length)
    const resolvedpromise = await Promise.all([group, totalgroupmembers , groupDetails])
    if(resolvedpromise && group){
      res.status(200).json({inGroup: true , totalgroupmembers:totalgroupmembers.length , userinfo:userinfo , gimage : groupDetails.imageUrl })
    }else{
      res.status(200).json({inGroup:false})
    }
  }catch(error){
    console.log(error)
    res.status(200).json({inGroup:false})
  }
}

// exports.getAllUsersOfGroup = async (req, res) => {
//   try {
//       const { id } = req.body;

//       // Find the group by ID
//       const group = await groupModal.findByPk(id);
      
//       console.log('group ===>>',group)
//       if (!group) {
//           return res.status(200).json({ message: 'Group not found' });
//       }
      
//       const allUsers = await group.getUsers();

//       if (!allUsers || allUsers.length === 0) {
//           return res.status(200).json({ message: 'No users in this group' });
//       }

//       return res.json({ allUsers });
//   } catch (error) {
//       console.log(error);
//       res.status(500).json({ message: 'Failed to retrieve group members'  });
//   }
// };

exports.getAllUsersOfGroup = async (req, res) => {
  try {
    const { groupid } = req.body;

    // Fetch all users belonging to the group using Sequelize associations
    const allUsers = await userModal.findAll({
      attributes: ['id', 'name'],  // Specify the attributes you want to retrieve
      include: {
        model: groupModal,
        attributes:[],// Exclude the group attributes
        where: { id: groupid },
        through: { attributes: [] } // Exclude attributes from the join table
      }
    });

    if (!allUsers || allUsers.length === 0) {
      return res.status(200).json({ message: 'No users in this group' });
    }

    return res.json({ allUsers });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to retrieve group members' });
  }
};

exports.GroupAdminId = async (req,res,next)=>{
  try{
    const {groupid} = req.body;
    const groupAdmin = await groupModal.findByPk(groupid) ;
    //console.log(groupAdmin.id)
    res.status(200).json(groupAdmin)

  }catch(error){
    console.log(error)
    res.status(201).json({error: error})
  }

}

exports.deleteGroupMember= async(req,res,next)=>{
  try{
    const {groupid,userid} = req.body;
    const deleteresponse = await userGroupModal.findOne({where : {userAuthDatumId : userid , groupDatumid : groupid }}) ;
    if(deleteresponse){
      await deleteresponse.destroy()
      res.status(200).json({message : 'deleted successfully'})
    } 
  } catch(error){
    console.log(error)
    res.status(201).json({error : error})
  }

}


