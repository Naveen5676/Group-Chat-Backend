const sequelize = require('../Util/database');
const Sequelize = require('sequelize');

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
    }
});

module.exports = chatModal