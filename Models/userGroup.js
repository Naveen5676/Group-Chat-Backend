const { use } = require('../Routers/Group');
const sequelize = require('../Util/database');
const Sequelize = require('sequelize')

const userGroup =sequelize.define('userGroup', {
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    }
})

module.exports = userGroup