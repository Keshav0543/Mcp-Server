import "dotenv/config";
import express from "express";
import modelCall from "./config/model.js";
import main from "../Backend/config/db.js";
const app=express();

app.use(express.json());

app.post("/chat/model",async (req,res)=>{
    try{
        const {query}=req.body;
        const response=await modelCall(query);
        res.status(200).json({
            response
        });
    }
    catch(err){
        res.status(400).json({
            message:err.message
        });
    }
});

const InitializeConnection=async ()=>{
    try{
        await main();
        app.listen(3000,()=>{
            console.log("Server Start At port:3000");
        })
    }
    catch(err){
        console.log("Error: ",err.message);
    }
};

InitializeConnection();