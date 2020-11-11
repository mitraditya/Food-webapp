const mongoose = require('mongoose')

const usersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    addtofavlist: {
        type: Array,
        required: false
    }
})

module.exports = mongoose.model('users', usersSchema)