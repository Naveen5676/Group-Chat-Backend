const sequelize = require('../Util/database');
const Sequelize = require('sequelize');

const groupModal = sequelize.define('groupData', {
    groupid:{
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement:true,
        primaryKey: true
    },
    name: Sequelize.STRING,
})

module.exports = groupModal