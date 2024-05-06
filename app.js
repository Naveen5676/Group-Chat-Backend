const express = require("express");
const cors = require("cors");
const sequelize = require("./Util/database");
const bodyParser = require("body-parser");

const userRouter = require('./Routers/User');
const chatRouter = require('./Routers/Chat');

const User = require('./Models/User');
const Chat = require('./Models/Chat');


const app = express();


User.hasMany(Chat);
Chat.belongsTo(User);


app.use(cors({
    origin : 'http://localhost:5173',
    methods : ["GET", "POST"]
}));
app.use(bodyParser.json({extended : false}));
app.use(userRouter);
app.use(chatRouter);

sequelize
  .sync()
  .then(() => { 
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
