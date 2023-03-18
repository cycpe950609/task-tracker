import { Router } from "express";
import qs from "qs";
import axios from "axios";
import { filterStateType, TaskEntryType } from "./taskType";

const taskRoute = Router()

taskRoute.post("/select",async (req,res)=>{
    console.log(req.body.data);
    const {state,contain,start,end,orderby} = req.body.data;
    const list = [];
    for (let idx = 0; idx < end - start; idx++) {
        list.push({ title : `Quey ${idx} title`, body: `Quey from ${start} to ${end} body`, state : filterStateType.open } as TaskEntryType)
    }
    return res.send(JSON.stringify(list));
})

taskRoute.post("/create",async (req,res)=>{
    console.log(req.body.data);
    
    return res.send("create")
})

taskRoute.patch("/update",async (req,res)=>{
    console.log(req.body.data);
    
    return res.send("update")
})

taskRoute.delete("/delete",async (req,res)=>{
    console.log(req.body.data);
    
    return res.send("delete")
})



export default taskRoute;