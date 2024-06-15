const Sequelize = require('sequelize');
const sequelize = require('../Util/Database') 

const userModal = sequelize.define("userAuthData" , {
    id:{
        type:Sequelize.INTEGER,
        primaryKey : true,
        autoIncrement:true,
        allowNull: false
    },
    name:{
        type:Sequelize.STRING,
        allowNull:false
    },
    email:{
        type:Sequelize.STRING,
        unique:true,
        allowNull:false
    },
    phoneNo:{
        type:Sequelize.BIGINT,
        allowNull:false
    },
    password: {
        type: Sequelize.STRING,
        allowNull:false,
    }

})

module.exports = userModal