const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    permissions: {
        read: {
            type: Boolean,
            default: false
        },
        write: {
            type: Boolean,
            default: false
        },
        admin: {
            type: Boolean,
            default: false
        },
        accessHojaCorte: {
            type: Boolean,
            default: false
        },
        accessCorteExplorer: {
            type: Boolean,
            default: false
        },
        accessCorteAnalytics: {
            type: Boolean,
            default: false
        },
        Cajero: {
            type: Boolean,
            default: false
        },
        accessCloudReports: {
            type: Boolean,
            default: false
        }
    }
});

// Middleware para cifrar el password antes de guardar
employeeSchema.pre('save', async function (next) {
    if (this.isModified('password') || this.isNew) {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = { Employee };
