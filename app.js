const express = require("express");
const cors = require("cors");
const sequelize = require("./Util/database");
const bodyParser = require("body-parser");

const userRouter = require('./Routers/User')

const app = express();

app.use(cors({
    origin : 'http://localhost:5173',
    methods : ["GET", "POST"]
}));
app.use(bodyParser.json({extended : false}))
app.use(userRouter)

sequelize
  .sync()
  .then(() => { 
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
