import { config } from 'dotenv';
import { Router } from "express";
import qs from "qs";
import axios from "axios";
import { filterStateType, TaskEntryType } from "./taskType";

config()//dotnev

const taskRoute = Router()

const ISSUE_TRACKER_USERNAME = process.env.ISSUE_TRACKER_USERNAME
const ISSUE_TRACKER_REPO_NAME = process.env.ISSUE_TRACKER_REPO_NAME;

taskRoute.post("/select",async (req,res)=>{

    const GITHUB_LIST_ISSUE_URL = `https://api.github.com/repos/${ISSUE_TRACKER_USERNAME}/${ISSUE_TRACKER_REPO_NAME}/issues`

    console.log("=============================================================")
    console.log(req.body.data);
    console.log("=============================================================")
    const {token,state,contain,pagesize,page,orderby} = req.body.data;

    const queryOption = {
        state       : 'all',
        per_page    : pagesize,
        page        : page
    }
    const qstring = qs.stringify(queryOption,{ arrayFormat: 'comma' });

    const selectUri = `${GITHUB_LIST_ISSUE_URL}?${qstring}`

    const rtv = await axios.get(selectUri,{
        headers : {
            "Accept" : "application/vnd.github+json",
            "Authorization" : `Bearer ${token}`,
            "X-GitHub-Api-Version" : "2022-11-28"
        }
    })
    // console.log(rtv.data)

    type queryIssueType = { 
        state : "open"|"closed";
        number: number;
        title: string; 
        body: string; 
        labels: {
            name: "inprocess"|"done" 
        }[]
    }

    const list = rtv.data.map((item: queryIssueType) => {
        // console.log(item.title,item.body)

        const getState = () => {
            if(item.state === "open"){
                let isInProcess = false;
                let isDone = false;
                item.labels.map((label)=>{
                    switch(label.name){
                        case "done": { isDone = true; break; }
                        case "inprocess": { isInProcess = true; break; }
                    }
                })
                if(isDone) 
                    return filterStateType.done;
                if(isInProcess)
                    return filterStateType.inprocess;
                return filterStateType.open;
            }
            return filterStateType.deleted
        }

        return { 
            index : item.number,
            title : item.title, 
            body: item.body, 
            state : getState() 
        } as TaskEntryType
    });
    // const listLength = list.length
    // for (let idx = 0; idx < 10 - listLength; idx++) {
    //     list.push({ title : `Query ${idx} title`, body: `Query body`, state : filterStateType.open } as TaskEntryType)
    // }
    console.log("Current Queue : ",page)
    console.log(list)

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