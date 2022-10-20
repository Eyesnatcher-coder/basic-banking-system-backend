import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import e from "express";

const port = process.env.PORT || 3000;

const app = express();
app.use(express.json())
app.use(express.urlencoded())
app.use(cors())

mongoose.connect(
"mongodb+srv://Harsh:zsRYZ7qWn1GCjBIv@cluster0.3jb09.mongodb.net/?retryWrites=true&w=majority",{useNewUrlParser:true,useUnifiedTopology:true})
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log("Infod Database connected");
});

const infoSchema = new mongoose.Schema({
    name: String,
    account: Number,
    email: String ,
    savings: Number
})


const Infod = new mongoose.model("infod", infoSchema );
app.get("/",async (req,res)=>{
    await Infod.find({}).then((val,err)=>{
        if(err){
            console.log(err)
            res.send("error encounterred")
        }
        else{
            res.send(val);
        }
    })
})

// app.post("/",(req,res)=>{
//     const {name,account,email,savings} = req.body;
//     Infod.findOne({email:email},(err,info)=>{
//         if(info){
//             res.send({message:"user already registered"});
//         }
//         else{
//             const info = new Infod({
//                 name:name,
//                 account:account,
//                 email:email,
//                 savings:savings
//             })
//             info.save(err =>{
//                 if(err){
//                     res.send("error encountered ",err)
//                 }
//                 else{
//                     res.send({message:"Successfully Registered"})
//                 }
//             })
//         }
//     })
// })

const transaction_money = [];



var new_senderaccountno;

app.put("/customerlist/:account",async (req,res)=>{
    console.log(req.body)
    // Infod.update({"email":req.body.email},{$set:{account:req.body.account, savings:req.body.savings}},{multi: true})
    new_senderaccountno=req.body.account;
    await Infod.findOneAndUpdate({account:req.body.account},{savings:req.body.savings},{multi:true})
    Infod.findOne({account:req.body.account},(err,val)=>{
        if(err){
            console.log("error here")
        }
        else{
            console.log(val.name);
        }
    })
    res.sendStatus(200)
})  

app.post("/customerlist/*",async(req,res)=>{
    // console.log(req.body);
    const {nameofperson, savingvalue} = req.body;
    var transaction_money_obj = {
        senderaccountno: new_senderaccountno,
        recievername: "",
        amountsend :0 ,
        recieverbalance : 0 
    }
    transaction_money_obj.recievername=nameofperson;
    var balance=0;
    Infod.findOne({name:{$all:nameofperson}},(err,val)=>{
        if(err){
            console.log(err);
        }
        else{
            balance=val.savings;
            balance=balance+savingvalue;
            transaction_money_obj.recieverbalance=balance;
            transaction_money_obj.amountsend=savingvalue;
            Infod.findOneAndUpdate({name:{$all:nameofperson}},{$set:{savings:balance}},(err2,val2)=>{
                if(err2){
                    console.log(err2)
                }
                else{
                    // console.log("hooray");
                }
            })
            // console.log(nameofperson,balance);
            balance=0;
            transaction_money.push(transaction_money_obj);
        console.log(transaction_money);
        }
        
    })
    res.sendStatus(200)
}) 


app.get("/transaction_history",async(req,res)=>{
    res.send(transaction_money);
})


app.listen(port,()=>{
    console.log("server is running on port",port)
});