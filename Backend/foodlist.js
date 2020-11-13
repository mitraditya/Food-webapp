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
    },
    image: {
        type: String,
        required: true
    },
    ingredients: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    review: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('foodList', foodListSchema)