const sequelize = require('../Util/database');
const Sequelize = require('sequelize');

const archeivedchatModal =  sequelize.define('chatData',{
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
    fileurl:{
        type:Sequelize.STRING,
        allowNull:true

    },
    filename:{
        type:Sequelize.STRING,
        allowNull:true
    },
});

module.exports = archeivedchatModal