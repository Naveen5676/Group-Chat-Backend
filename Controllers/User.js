const userModal = require("../Models/User");
const bcrypt = require("bcrypt");

exports.Signup = async (req, res, next) => {
  try {
    const email = req.body.email;
    const name = req.body.name;
    const phoneno = req.body.phoneno;
    const pwd = req.body.password;

    // Check if email already exists
    const existingUser = await userModal.findOne({ where : {email : email} });
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
