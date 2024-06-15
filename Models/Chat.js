const sequelize = require('../Util/Database');
const Sequelize = require('sequelize');

//should have named messageModel
const chatModal =  sequelize.define('chatData',{
    id:{
        type:Sequelize.INTEGER,
        primaryKey : true,
        autoIncrement:true,
        allowNull: false
    },
    message:{
        type:Sequelize.STRING,
        allowNull:false
    },
    fileUrl:{
        type:Sequelize.STRING,
        allowNull:true

    },
    fileName:{
        type:Sequelize.STRING,
        allowNull:true
    }
});

module.exports = chatModal