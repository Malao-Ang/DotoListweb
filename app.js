const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const lodash = require('lodash');
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Kaewmanee:malao_01401002524@cluster0.mucgu.mongodb.net/todolistDB", {
  useNewUrlParser: true,
});

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);
const Item1 = new Item({
  name: "Welcome to your to do list.",
});
const Item2 = new Item({
  name: "Hit the + bytton to add the new list",
});
const Item3 = new Item({
  name: "<-- Hit this to delete an item.",
});
const defaultItems = [Item1, Item2, Item3];
const listSchema = {
  name:String,
  items:[itemsSchema]
};

const List = mongoose.model("List",listSchema);



app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved defult items to DB");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name:itemName,
  });
  if(listName === "Today"){
    item.save();
    res.redirect('/');
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect('/'+listName);
    });
  }
});

app.post('/delete',function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("Sucessfully deleted checked item.");
        res.redirect('/');
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect('/'+listName);
      }
    });

  }
  // console.log(req.body.checkbox);
});

// app.get("/work", function (req, res) {
//   res.render("list", { listTitle: "Work List", newListItems: workItems });
// });

app.get('/:customlistname',function(req,res){
  // console.log(req.params.customlistname);
  const customlistname = lodash.capitalize(req.params.customlistname);
  List.findOne({name:customlistname},function(err,foundLists){
    if(!err){
      if(!foundLists){
        console.log("Doesn't Exit");
        const list = new List({
          name:customlistname,
          items:defaultItems,
        });
        list.save();
        res.redirect('/'+customlistname);
        //Create a new List
      }else{
        console.log("Exists!");
        res.render("list",{listTitle:foundLists.name,newListItems:foundLists.items});
      }
    }
  });
  
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
