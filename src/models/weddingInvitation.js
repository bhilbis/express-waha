const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WeddingInvitation = sequelize.define('WeddingInvitation', {
  id_wedding: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  chatId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  namaLakiLaki: {
    type: DataTypes.STRING,
    allowNull: false
  },
  namaPerempuan: {
    type: DataTypes.STRING,
    allowNull: false
  },
  hariAkad: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tanggalAkad: {
    type: DataTypes.DATE,
    allowNull: false
  },
  waktuMulaiAkad: {
    type: DataTypes.TIME,
    allowNull: false
  },
  waktuSelesaiAkad: {
    type: DataTypes.TIME,
    allowNull: false
  },
  lokasiAkad: {
    type: DataTypes.STRING,
    allowNull: false
  },
  hariResepsi: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tanggalResepsi: {
    type: DataTypes.DATE,
    allowNull: false
  },
  waktuMulaiResepsi: {
    type: DataTypes.TIME,
    allowNull: false
  },
  waktuSelesaiResepsi: {
    type: DataTypes.TIME,
    allowNull: false
  },
  lokasiResepsi: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: false,
  tableName: 'wedding_invitations',
});

module.exports = WeddingInvitation;
