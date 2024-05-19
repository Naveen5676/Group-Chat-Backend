const express = require("express");
const cors = require("cors");
const sequelize = require("./Util/database");
const bodyParser = require("body-parser");

const userRouter = require('./Routers/User');
const chatRouter = require('./Routers/Chat');
const groupRouter = require('./Routers/Group');

const User = require('./Models/User');
const Chat = require('./Models/Chat');
const Group = require('./Models/Group');
const UserGroup = require('./Models/userGroup');

const app = express();

User.hasMany(Chat);
Chat.belongsTo(User);

Group.hasMany(Chat);
Chat.belongsTo(Group);

User.belongsToMany(Group, { through: UserGroup });
Group.belongsToMany(User, { through: UserGroup });

Group.belongsTo(User, { foreignKey: 'AdminId', constraints: true, onDelete: 'CASCADE' });

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ["GET", "POST"]
}));
app.use(bodyParser.json({ extended: false }));
app.use(userRouter);
app.use(chatRouter);
app.use(groupRouter);

sequelize
  .sync({ force: false })
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
