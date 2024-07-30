const { DataTypes } = require ('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Invitation', {
    id_wedding: {
        type: DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement: true,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    date_sent: {
        type: DataTypes.DATE,
        allowNull: true,
    }, 
    date_read: {
        type: DataTypes.DATE,
        allowNull: true, 
        defaultValue: null
    },
    date_receive: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    receiver_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    sender_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    }, {
      timestamps: false, 
      tableName: 'message',
})

module.exports = Message;