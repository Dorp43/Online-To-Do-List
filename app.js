//jshint esversion:6

//mongo "mongodb+srv://cluster0.x6udd.mongodb.net/todolistDB" --username admin-dor

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-dor:Q1w23454139@cluster0.x6udd.mongodb.net/todolistDB");     //Database called todolistDB

const itemsSchema = {                                         //Schema model
  name: String
}

const Item = mongoose.model("Tasks", itemsSchema);            //Mongoose model

const item1 = new Item ({
  name: "Welcome to your ToDoList"
});

const item2 = new Item ({
  name: "Hit the + button to aff a new item."
});

const item3 = new Item ({
  name: "☚ Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

//Custom list schema
const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

// const day = date.getDate();

  Item.find({}, function(err, foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfully saved default items to DB.");
        }
      });
      res.redirect("/");
    }else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  }); 
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  
  //Insert item to database
  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

app.post("/delete", function(req,res){

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
      console.log("Successfuly deleted checked item.")
      res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){ //Pulls item from collection -> items array -> id of the checked item
        if(!err){
          res.redirect("/" + listName); 
        }
    });
  }
});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
      
        list.save();
        console.log("Succesfully created " + customListName + " list.");
        res.redirect("/" + customListName);
      }else{
        res.render("list", {listTitle: customListName, newListItems: foundList.items})
      }
    }
  });


});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server is now Running");
});
