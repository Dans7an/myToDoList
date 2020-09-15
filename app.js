//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-Danstan:2580@cluster0.r5tpd.mongodb.net/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item",itemsSchema);

const sermon = new Item ({
  name: "Listen to a sermon"
});
const breakfast = new Item ({
  name: "Have breakfast"
});
const study = new Item ({
  name: "Start coding"
});
const defaultItems = [sermon,breakfast,study];
const listSchema = {
  name: String,
  items : [itemsSchema]
};
const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item.find(function(err,foundItems){

      if (foundItems.length === 0) {
        Item.insertMany(defaultItems, function(err){
          if (err) {
            console.log(err);
          } else {
            console.log("Successfully added to the Array");
          }
        });
          res.redirect("/");
      } else {
        // const day = date.getDate();
          res.render("list", {listTitle: "Today", newListItems: foundItems});
      }

  });


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  })
  if (listName==="Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err,foundlist){
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/" + listName)
    })
  }
});

app.post("/delete", function(req,res){
  const checkedItemID = new mongoose.mongo.ObjectID(req.body.checkbox);
  const listName = req.body.listName;

// const checkedItemID = new mongoose.mongo.ObjectID(req.body.checkbox);

if (listName==="Today") {
  Item.findByIdAndRemove(checkedItemID, function(err){
    if(!err){
      console.log("Deleted Successfully!");
      res.redirect("/");
    }
  })

  //
  // Item.deleteOne({_id: deleteditem}, function(err){
  //   if (!err) {
  //     console.log("Successfully Deleted");
  //     res.redirect("/");
  //   }
  // })

} else {
  List.findOneAndUpdate({name:listName}, {$pull: {items: {_id: checkedItemID}}}, function(err,foundlist){
    if(!err){
      res.redirect("/" + listName);
    }
  })
}
})

app.get("/:listName",function(req,res){
  const listName = _.capitalize(req.params.listName);

  List.findOne({name: listName}, function(err,foundlist){
    if (!err) {
      if (!foundlist) {
        //Create a new list
        const newList = new List ({
          name: listName,
          items: defaultItems
        });
          newList.save();
          res.redirect("/" + listName)
          } else {
            //show an existing List
            res.render("list", {listTitle: foundlist.name , newListItems: foundlist.items});
      }
    }
  })
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
