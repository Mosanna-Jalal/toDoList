//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");




const app = express();




app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-mosanna:test123@cluster0.bc4u0.mongodb.net/todolistDB",{useNewUrlParser:true});
const itemsSchema= {
  name:String
};

const Item=mongoose.model("Item",itemsSchema);

const chores=new Item({
  name:"chores"
});

const meal=new Item({
  name:"meal"
});
const grooming= new Item({
  name:"grooming"
});
const defaultItems=[chores,meal,grooming];

const listSchema={
  name:String,
  items:[itemsSchema]
};

const List= mongoose.model("List",listSchema);

app.get("/",function(req,res){

Item.find({},function(err,foundItems){
  if(err){
    console.log(err);
  }
  else{
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("successfully inserted");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list",{listTitle: "Today" , newListItems : foundItems});
    }

  }
});

});

app.post("/",function(req,res){
  let newItem = req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name:newItem
  });
  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

});

app.post("/delete",function(req,res){
const checkedItemId= req.body.checkbox;
const listName=req.body.listName;
if(listName==="Today"){
  Item.findByIdAndRemove(checkedItemId,function(err){
    if(!err){
      console.log("successfully deleted using findIdAndRemove method");
    }
    res.redirect("/");
  });
}
else{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id: checkedItemId}}},function(err,foundList){
    if(!err){
      res.redirect("/"+listName);
    }
  });
}

});

app.get("/:customListName",function(req,res){
  const customListName= _.capitalize(req.params.customListName);
  console.log(customListName);
  List.findOne({name:customListName},function(err,result){
    if(!err){
     if(!result){
       const list=new List({
         name:customListName,
         items:defaultItems
       });

       list.save();
       res.redirect("/"+customListName);
     }
     else{
       res.render("list",{listTitle: result.name , newListItems : result.items});
     }
    }


  });


});
app.post("/work",function(req,res){
  let item= req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
});
app.get("/about",function(req,res){
  res.render("about");
})


let port=process.env.PORT;
if(port==null || port==""){
  port=3000;
}

app.listen(port,function(){
  console.log("server has started on port "+port);
})
