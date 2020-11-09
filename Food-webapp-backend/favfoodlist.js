const mongoose = require('mongoose')

const favFoodListSchema = new mongoose.Schema({
    oldid: {
        type: String,
        required: true
    },
    item: {
        type: String,
        required: true
    },
    cuisine: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('favFoodList', favFoodListSchema)