const express = require('express')
const mongoose = require('mongoose')
var cors = require('cors')
var app = express()

app.use(cors())
const foodList = require('./foodlist')

mongoose.connect('mongodb://localhost/favfoodlist', {
    useNewUrlParser: true, useUnifiedTopology: true
})
app.use(express.json());
app.use(express.urlencoded({ extended: false }))

app.get('/', async (req, res) =>{
    const fList = await foodList.find()
    res.json({message: 'Hello World', fList: fList});
})

app.post('/foodList', async (req, res) =>{
    await foodList.create({ item: req.body.item, description: req.body.description, cuisine: req.body.cuisine})
    res.redirect('/')
})

app.get('/foodList', async (req, res) => {
    const fList = await foodList.find()
    res.json({ fList: fList});
});

app.delete('/deleteitem', async (req, res) => {
    await foodList.findOneAndRemove({ _id: mongoose.Types.ObjectId(req.query.id)},function (err) {
        if(err){
            console.log(err)
            res.send("nahi hai maal")
        }else{
        console.log("Successful deletion");
        res.send("Successfully Deleted")}
      }
)})

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`))