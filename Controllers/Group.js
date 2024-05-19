const groupModal = require("../Models/Group");
const userGroupModal = require('../Models/userGroup');
const userModal = require('../Models/User');

exports.createGroup = async (req, res, next) => {
  try {
    const { groupname } = req.body;
    const userid = req.user.id;

    const group = await groupModal.create({
      name: groupname,
      AdminId: userid,
    });

    console.log('group ===>>',group.dataValues)
    const userGroup = userGroupModal.create({
      userAuthDatumId:userid,
      groupDatumGroupid:group.dataValues.groupid
    })
    const createdgroupsuccessfully= await Promise.all([group , userGroup])
    if (createdgroupsuccessfully) {
      res.status(201).json({ message: "Successfully added group" });
    } else {
      throw new Error("Something went wrong");
    }
  } catch (error) {
    res.status(400).json(error);
    console.log(error);
  }
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

    console.log('group id ', groupid)
    const group = await groupModal.findByPk(groupid);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    await userGroupModal.create({
      userAuthDatumId: user.id,
      groupDatumGroupid: groupid,
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
    const group = await userGroupModal.findOne({where : {userAuthDatumId: userid , groupDatumGroupid:groupid}});
    console.log('group ==>>', group)
    const totalgroupmembers = await userGroupModal.findAll({where : {groupDatumGroupid:groupid}})
    console.log('total count' , totalgroupmembers.length)
    const resolvedpromise = await Promise.all([group, totalgroupmembers])
    if(resolvedpromise && group){
      res.status(200).json({inGroup: true , totalgroupmembers:totalgroupmembers.length})
    }else{
      res.status(200).json({inGroup:false})
    }
  }catch(error){
    console.log(error)
    res.status(200).json({inGroup:false})
  }
}

// exports.joinGroup = async(req,res,next)=>{
//   try{
//     const { groupid } = req.body;
//     const userid = req.user.id
//     const joingroup = await userGroupModal.create({
//       userAuthDatumId:userid,
//       groupDatumGroupid:groupid
//     })
//     if(joingroup){
//       res.status(200).json({message:"Successfully joined group" })
//     }
//   }catch(error){
//     console.log(error)
//     res.status(201).json(error)
//   }
// }