const express = require("express");
const cors = require("cors");
const sequelize = require("./Util/Database");
const bodyParser = require("body-parser");
const {Cronjob} = require('./jobs/cron')
const helmet = require('helmet')
const morgan = require('morgan')
const path = require('path');
const fs = require('fs')
const dotenv = require('dotenv');
dotenv.config();

const userRouter = require('./Routers/User');
const chatRouter = require('./Routers/Chat');
const groupRouter = require('./Routers/Group');

const User = require('./Models/User');
const Chat = require('./Models/Chat');
const Group = require('./Models/Group');
const UserGroup = require('./Models/userGroup');

const app = express();

//to store they console.log in a file and flag a refers to append 
const accessLogScreen = fs.createWriteStream(path.join(__dirname , 'access.log'), {flags: 'a'})

User.hasMany(Chat);
Chat.belongsTo(User);

Group.hasMany(Chat);
Chat.belongsTo(Group);

User.belongsToMany(Group, { through: UserGroup });
Group.belongsToMany(User, { through: UserGroup });

Group.belongsTo(User, { foreignKey: 'adminId', constraints: true, onDelete: 'CASCADE' });

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ["GET", "POST"]
}));
//helmet  is used for security, secure Express apps by setting HTTP response headers.
app.use(helmet())
//morgan is used to write all logs to a file called access.log
app.use(morgan('combined' , {stream:accessLogScreen}))
app.use(bodyParser.json({ extended: false }));
app.use(userRouter);
app.use(chatRouter);
app.use(groupRouter);

Cronjob.start();

sequelize
  .sync({ force: false })
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
