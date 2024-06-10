const mongoose = require('mongoose');

const corteSchema = new mongoose.Schema({
    RCC: {
        type: String,
        required: true
    },
    efectivo: {
        type: mongoose.Schema.Types.Mixed
    },
    totalEfectivo: {
        type: Number
    },
    dolares: {
        type: mongoose.Schema.Types.Mixed
    },
    retiroEnEfectivo: {
        type: Number
    },
    tarjeta: {
        type: Number
    },
    comprasEfectivo: {
        type: mongoose.Schema.Types.Mixed
    },
    gastosEfectivo: {
        type: mongoose.Schema.Types.Mixed
    },
    vales: {
        type: mongoose.Schema.Types.Mixed
    },
    devoluciones: {
        type: mongoose.Schema.Types.Mixed
    },
    totalCorte: {
        type: Number
    },
    totalSistema: {
        type: Number
    },
    diferencia: {
        type: Number
    },
    recibido: {
        type: String
    },
    cajero: {
        type: String
    },
    fecha: {
        type: String
    },
    hora: {
        type: String
    },
    fechaHora: {
        type: Date
    }
});

const Corte = mongoose.model('Cortes', corteSchema);

module.exports = { Corte: Corte };