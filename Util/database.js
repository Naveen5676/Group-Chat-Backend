const Sequelize = require('sequelize');

const sequelize = new Sequelize ( 'group-chat' , 'root' , 'Abcd@1234', {
    dialect:"mysql",
    host: "localhost"
})

module.exports = sequelize