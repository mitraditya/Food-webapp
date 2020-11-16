const express = require("express");
const mongoose = require("mongoose");
var cors = require("cors");
var app = express();

app.use(cors());
const foodList = require("./foodlist");
//const MONGO_URL = "mongodb://localhost/foodapp";
const MONGO_URL = "mongodb+srv://new-user:abcd1234@cluster0.8emsa.mongodb.net/<dbname>?retryWrites=true&w=majority";

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/foodList", async (req, res) => {
  await users.findById(req.body.id, async function (err, user) {
    if(err){
      console.log(err);
      console.log("User Not Found")
      res.json({ message: "User Not Found" });
    }
    else{
      if(user.isadmin == true)
      {
        await foodList.create({
          item: req.body.item,
          description: req.body.description,
          cuisine: req.body.cuisine,
          image: req.body.image,
          ingredients: req.body.ingredients,
          price: req.body.price,
          review: req.body.review
        });
        console.log("Item Added Successfully")
        res.json({ message: "Item Added Successfully" });
      }
      else{
        console.log("Unauthorized Access. Creation Denied.")
        res.json({ message: "Unauthorized Access. Creation Denied." });
      }
    }
  })
});

app.post("/favFoodList", async (req, res) => {
  await foodList.findById(mongoose.Types.ObjectId(req.query.id), async function (err,doc) {
    if (err) {
      console.log(err);
      console.log("Item not found")
      res.json({ message: "Item Not found" });
    } else {
      await users.findById(mongoose.Types.ObjectId(req.query.uid), async function (err,quser) {
        if (err) {
          console.log(err);
          console.log("User Not Found")
          res.json({ message: "User Not Found" });
        } else {
          var entry = {
            oldid: doc._id,
            item: doc.item,
            cuisine: doc.cuisine,
            description: doc.description,
            image: doc.image,
            ingredients: doc.ingredients,
            price: doc.price,
            review: doc.review
          };
          var flag = false;
          if (quser.addtofavlist) {
            await quser.addtofavlist.forEach((qentry) => {
              if (String(qentry.oldid) === String(doc._id)) {
                  console.log("Already Added")
                  flag = true;
                  res.json({ message: "Already added to Favourites" });
              }
            });
          }
          if (flag == false) {
            var update = quser;
            update.addtofavlist.push(entry);
            await users.findByIdAndUpdate(quser._id, update, (err, resp) => {
              if (err) {
                  console.log(err);
                  console.log("Error in creating")
              } else if (resp) {
                  console.log("Entry Created")
                  res.json({ message: "Added to Favourites" });
              }
            });
          }
        }
      });
    }
  });
});

app.get("/foodList", async (req, res) => {
  const fList = await foodList.find();
  res.json({ fList: fList });
});

app.get("/favFoodList", async (req, res) => {
  await users.findById(req.query.id, async (err, quser) => {
      if(err){
        console.log(err);
        console.log("User Not Found")
        res.json({ message: "User Not Found" });
      }
      else{
        res.json({ favList: quser.addtofavlist });
      }
  });
});

app.delete("/deleteitem", async (req, res) => {
  var newList = [];
  await users.findById(req.query.uid, function (err, quser) {
    if (err) {
        console.log(err);
        console.log("User Not Found")
        res.json({ message: "User Not Found" });
      } else{
        quser.addtofavlist.forEach((food) => {
            if (food.oldid != req.query.id) {
              newList.push(food);
            }
          });
          var update = quser;
          update.addtofavlist = newList;
          users.findByIdAndUpdate(req.query.uid, update).then(res.json({ message: "Successfully Deleted"} ));
      }
  });
});

app.delete("/fooditemdelete", async (req, res) => {
  await users.findById(req.body.id, async function (err, user) {
    if(err){
      console.log(err);
      console.log("User Not Found")
      res.json({ message: "User Not Found" });
    }
    else{
      if(user.isadmin == true)
      {
        await foodList.findOneAndDelete({_id: req.body.itemid }, function (err, docs) { 
          if (err){ 
              console.log(err) 
          } 
          else{ 
              console.log("Deleted Item : ", docs);
              console.log("Item Deleted Successfully")
          } 
        });
        const uList = await users.find();
        uList.forEach((quser) =>{
          if(quser.isadmin === false){
          var newList = [];
          quser.addtofavlist.forEach((food) => {
            if (food.oldid != req.body.itemid) {
              newList.push(food);
            }
          });
          var update = quser;
          update.addtofavlist = newList;
          users.findByIdAndUpdate(quser._id, update).then(console.log("Successfully Deleted"));
          res.json({ message: "Successfully Deleted"} )
      }})
      }
      else{
        console.log("Unauthorized Access. Deletion Denied.")
        res.json({ message: "Unauthorized Access. Deletion Denied." });
      }
    }
  })
});

//User Authentication
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const users = require("./users");

const initializePassport = require("./passport-config");
initializePassport(
  passport,
  async (email) => await users.find({ email: email }),
  async (id) => await users.findById(id)
);

app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

app.get("/", async (req, res) => {
    const fList = await foodList.find();
    res.json({ fList: fList });
  }
);

app.get("/login", checkNotAuthenticated, async (req, res) => {
  const uList = await users.find();
  res.json({ uList: uList });
});

app.post("/login", function (req, res) {
  var email = req.body.email;
  var password = req.body.password;
  console.log(email + " " + password);
  users.findOne({ email: email }, function (err, user) {
    if (err) {
      console.log(err);
    } else if (user == null) {
      console.log("No User with that email");
      return res.json({ success: false, message: "No User with that email" });
    } else if (user) {
      console.log("user found");

      const hash = user.password;
      bcrypt.compare(password, hash, function (err, isMatch) {
        if (err) {
          console.log(err);
        } else if (isMatch) {
          console.log("match");
          console.log(user._id + "  " + user.name);
          res.json({ id: user._id, name: user.name, success: true, isadmin: user.isadmin });
        }
        else if(!isMatch){
            console.log("Incorrect Password");
            res.json({success: false, message: "Incorrect Password", isadmin: user.isadmin })
        }
      });
    }
  });
});

app.get("/register", checkNotAuthenticated, async (req, res) => {
  const uList = await users.find();
  res.json({ uList: uList });
});

app.post("/register", checkNotAuthenticated, async (req, res) => {
    await users.find({ email: req.body.email }, async function (err, user){
        if (err) {
            console.log(err);
        } else if (user.length != 0) {
            console.log("An user with that mail already exists.");
            res.json({ success: "false", message: "An user with that mail already exists." });
        } else if (user.length == 0){
            try {
                const hashedPassword = await bcrypt.hash(req.body.password, 10);
                const user = await users.create({
                  name: req.body.name,
                  email: req.body.email,
                  password: hashedPassword,
                });
                console.log(user);
                res.send({ success: "true" });
              } catch {
                res.send({ success: "false", message: "Registration Failed" });
              }
        }
    })
});

app.delete("/logout", (req, res) => {
  req.logOut();
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
