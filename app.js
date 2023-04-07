//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');    // to tell the browser that we are using ejs

// mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");
mongoose.connect("mongodb://127.0.0.1:27017/mongodb+srv://saumj0203:4aZRct77SYgEVYkI@cluster0.rrx7woo.mongodb.net/test");

const itemsSchema = new mongoose.Schema ({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);   // singular version of collection name

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const item1 = new Item({
  name: "Sleep for 8 hours"
});

const item2 = new Item({
  name: "Work out for 30 mins"
});

const item3 = new Item({
  name: "One question"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {

  // const day = date.getDate();
    
  Item.find().then(function(foundItems) {
    // console.log(items);

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems).then(function() {
        console.log("Default data inserted to DB");
      }).catch(function(err) {
        console.log(err);
      })
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  }).catch(function(err) {
    console.log(err);
  })
  // var currentDay = today.getDay();
  // var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  // var day = "";
  // can do the same by using a switch statement and day variable
  
});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}).then(function(foundList) {
    if (!foundList) {
      const list = new List ({
        name: customListName,
        items: defaultItems
      });
    
      list.save();
      res.redirect("/" + customListName);
    } else {
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  }).catch(function(err) {
    console.log(err);
  })

  
});

app.post("/", function(req, res) {
  // const item = req.body.newItem;

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const itemNew = new Item({
    name: itemName
  });

  if (listName === "Today") {
    itemNew.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}).then(function(foundList) {
      foundList.items.push(itemNew);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
  

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
  
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId).then(function() {
      console.log("data deleted");
    }).catch(function(err) {
      console.log(err);
    })
  
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then(function(foundList) {
      res.redirect("/"+listName);
    })
  }

  
});

app.get("/work", function(req, res) {
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res) {
  res.render("about");
})


app.listen(3000, function () {
  console.log("Server started at port 3000");
});


