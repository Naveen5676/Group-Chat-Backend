const sequelize = require('../Util/Database');
const Sequelize = require('sequelize');

const groupModal = sequelize.define('groupData', {
    id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement:true,
        primaryKey: true
    },
    name: Sequelize.STRING,
    imageUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      }
})

module.exports = groupModal