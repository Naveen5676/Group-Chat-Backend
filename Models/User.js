const Sequelize = require('sequelize');
const sequelize = require('../Util/database') 

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
    phoneno:{
        type:Sequelize.BIGINT,
        allowNull:false
    },
    password: {
        type: Sequelize.STRING,
        allowNull:false,
    }

})

module.exports = userModal