//jshint esversion:6

const mongoose = require("mongoose")
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const _ = require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-chirag:3hirag22erma@cluster0.dd4ysti.mongodb.net/todolistDB")
// mongoose.connect("mongodb://127.0.0.1:27017/todolistDB")

const itemSchema = {
  name: String
}

const ListSchema = {
  name : String,
  items : [itemSchema]
}
 
const List = mongoose.model("List",ListSchema)

const Item = mongoose.model("Item",itemSchema)

const item1 = new Item({name:"Welcome to your todolist"})
const item2 = new Item({name:"socks"})
const item3 = new Item({name:"pants"})





app.get("/", function(req, res) {
  Item.find({})
  .then(function(items){
    if(items.length === 0){
      Item.insertMany([item1,item2,item3])
        .then(function(){
          console.log("successfully saved all documents")
        })
        .catch(function(err){
          console.log(err)
        })
        res.redirect("/")
    }
    else{
        const day = date.getDate();
        //mongoose.connection.close()
        res.render("list", {listTitle: day, newListItems: items});
    }})
  .catch(function(err){
    console.log(err)
  })

});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName)



  List.findOne({name : customListName })
    .then(function(foundList){
      if(!foundList){
        const list1 = new List ({
          name : customListName,
          items : [item1,item2,item3]
        })

        list1.save()

        res.redirect("/"+customListName)

      }
      else{
        res.render("list.ejs",{listTitle: foundList.name, newListItems: foundList.items})
      }
    })
    .catch(function(err){
      console.log(err)
    })

})
  

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list
  const day = date.getDate();

  const item4 = new Item({
    name : itemName
  })

  if(listName === day){
    item4.save()
    res.redirect("/")
  }
  else{
    List.findOne({name : listName})
    .then(function(foundList){
      foundList.items.push(item4)
      foundList.save()
      res.redirect("/"+listName)
    })
    .catch(function(err){
      console.log(err)
    })
    
  } 

});

app.post("/delete",(req,res)=>{
  const checkedItemId = req.body.checkBox
  const listName = req.body.listName
  const day = date.getDate();

  if(listName === day){
    Item.findByIdAndRemove(checkedItemId)
      .then(function(){
        console.log("successfully deleted document")
        res.redirect("/")
      })
      .catch(function(err){
        console.log(err)
      })
  }
  else{
    List.findOneAndUpdate({name : listName},{$pull : {items : {_id : checkedItemId}}})
    .then(function(){
      res.redirect("/"+listName)
    })
    .catch(function(err){
      console.log(err)
    })
    
  } 


})



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});


