const mongoose = require('mongoose')

const favFoodListSchema = new mongoose.Schema({
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