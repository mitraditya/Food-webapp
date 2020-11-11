const mongoose = require('mongoose')

const foodListSchema = new mongoose.Schema({
    item: {
        type: String,
        required: true
    },
    cuisine: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('foodList', foodListSchema)