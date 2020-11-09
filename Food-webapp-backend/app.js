const express = require('express')
const mongoose = require('mongoose')
const app = express()
const favFoodList = require('./favfoodlist')

mongoose.connect('mongodb://localhost/favfoodlist', {
    useNewUrlParser: true, useUnifiedTopology: true
})
app.use(express.json());
app.use(express.urlencoded({ extended: false }))

app.get('/', async (req, res) =>{
    const favList = await favFoodList.find()
    res.json({message: 'Hello World', favList: favList});
})

app.post('/favFoodList', async (req, res) =>{
    await favFoodList.create({ item: req.body.item})
    res.redirect('/')
})

app.get('/favFoodList', async (req, res) => {
    const favList = await favFoodList.find()
    res.json({ favList: favList});
});

app.delete('/deleteitem/:id', async (req, res) => {
    await favFoodList.deleteOne({ _id: req.params.id}).then(err => {
        if(err) {
            console.log(err)
            res.send("error")
        }
        res.send("Successfully deleted")
        console.log("Deleted")
    })

})

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`))