const userModal = require("../Models/User");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

function generatingToken(id){
  return jwt.sign({userId : id} , '564894165489465asdfsa48949848564sa98df985sa456498asdf')
}

exports.Signup = async (req, res, next) => {
  try {
    const email = req.body.email;
    const name = req.body.name;
    const phoneno = req.body.phoneno;
    const pwd = req.body.password;

    // Check if email already exists
    const existingUser = await userModal.findOne({ where: { email: email } });
    if (existingUser) {
      console.log(
        "this email from fronmtend ====>>>>>>",
        email,
        "existin email =========>",
        existingUser.dataValues
      );
      return res.status(400).json({ error: "Email already exists" });
    }

    let saltRounds = 10;
    bcrypt.hash(pwd, saltRounds, async (err, hashpwd) => {
      if (err) {
        throw new Error(
          "something went wrong while generating bcrypt password"
        );
      }
      let user = await userModal.create({
        name: name,
        email: email,
        phoneno: phoneno,
        password: hashpwd,
      });
      res.status(200).json(user);
    });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
};

exports.Login = async (req, res, next) => {
  try {
    const email = req.body.email;
    const pwd = req.body.password;

    const user = await userModal.findOne({ where: { email: email } });

    if (user) {
      bcrypt.compare(pwd, user.password, (error, result) => {
        console.log(result)
        if (result) {
          res.status(200).json({message : "success" , Token:generatingToken(user.id)});
        } else {
          res.status(401).json({message:'User not authorized'})
        }
      });
    }else{
      res.status(404).json({message:'user not found'})
    }
  } catch (err) {
    res.status(401).json({ error: err });
  }
};
