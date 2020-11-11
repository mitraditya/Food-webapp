const express = require('express')
const mongoose = require('mongoose')
var cors = require('cors')
var app = express()

app.use(cors())
const foodList = require('./foodlist')
const favFoodList = require('./favfoodlist')
const MONGO_URL = 'mongodb://localhost/favfoodlist'

mongoose.connect(MONGO_URL, {
    useNewUrlParser: true, useUnifiedTopology: true
})
app.use(express.json());
app.use(express.urlencoded({ extended: false }))

// app.get('/', async (req, res) =>{
//     const fList = await foodList.find()
//     res.json({message: 'Hello World', fList: fList});
// })

app.post('/foodList', async (req, res) =>{
    await foodList.create({ item: req.body.item, description: req.body.description, cuisine: req.body.cuisine})
    res.redirect('/')
})

app.post('/favFoodList', async (req, res) =>{
    foodList.findById(mongoose.Types.ObjectId(req.query.id), async function (err, doc){
        if(err){
            console.log(err)
            res.json({message: 'Not found'});
        }else{
        favFoodList.exists({ oldid: doc._id }, async function(err, result) {
            if (err) {
                console.log(err)
                res.json({message: 'Error'});
            } else {
                if(result==false){
                    //create new entry in favFoodList
                    await favFoodList.create({ oldid: doc._id, item: doc.item, cuisine: doc.cuisine, description: doc.description})
                    console.log("Entry Created")
                    res.json({message: 'Entry created'});
                }
                else{
                    //return saying that it is already added to favourites
                    console.log("Already exists");
                    res.json({message: 'Already exists'});
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

//User Authentication
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override')
const users = require('./users')

const initializePassport = require('./passport-config');
initializePassport(passport,
    async email => await users.find({email: email}),
    async id => await users.findById(id) 
);

app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', async (req, res) =>{
    const fList = await foodList.find()
    if(req.isAuthenticated()){
        res.json({message: 'Hello World', fList: fList, name : req.user.name })
    }
    else{
        res.json({message: 'Hello World', fList: fList})
    }
})

app.get('/login', checkNotAuthenticated, async(req, res) => {
    const uList = await users.find()
    res.json({uList: uList})
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: 'login',
    failureFlash: true
}));

app.get('/register', checkNotAuthenticated, async(req, res) => {
    const uList = await users.find()
    res.json({uList: uList})
});

app.post('/register', checkNotAuthenticated, async(req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = await users.create({ name: req.body.name, email: req.body.email, password: hashedPassword})
        console.log(user)
        res.redirect('../Frontend/login.html');
    } catch {
        res.redirect('/register');
    }
});

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('login')
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`))