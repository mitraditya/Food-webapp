const express = require('express')
const mongoose = require('mongoose')
var cors = require('cors')
var app = express()

app.use(cors())
const foodList = require('./foodlist')
const favFoodList = require('./favfoodlist')

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

app.post('/favFoodList', async (req, res) =>{
    foodList.findById(mongoose.Types.ObjectId(req.query.id), async function (err, doc){
        if(err){
            console.log(err)
            res.send("Not found")
        }else{
        favFoodList.exists({ oldid: doc._id }, async function(err, result) {
            if (err) {
                console.log(err)
                res.send("Error")
            } else {
                if(result==false){
                    //create new entry in favFoodList
                    await favFoodList.create({ oldid: doc._id, item: doc.item, cuisine: doc.cuisine})
                    res.send("Entry created")
                }
                else{
                    //return saying that it is already added to favourites
                    console.log("Already exists");
                    res.send("Already exists");
                }
            }
          });
    }
      });
})

app.get('/foodList', async (req, res) => {
    const fList = await foodList.find()
    res.json({ fList: fList});
});

app.get('/favFoodList', async (req, res) => {
    const favList = await favFoodList.find()
    res.json({ favList: favList});
});

app.delete('/deleteitem', async (req, res) => {
    await favFoodList.findOneAndRemove({ _id: mongoose.Types.ObjectId(req.query.id)},function (err) {
        if(err){
            console.log(err)
            res.send("Not found")
        }else{
        console.log("Successful deletion");
        res.send("Successfully Deleted")}
      }
)})

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`))