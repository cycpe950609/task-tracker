import { config } from 'dotenv';
import { query, Router } from "express";
import qs from "qs";
import axios from "axios";
import { TaskEntryType } from "./taskType";
import { filterStateType, QueryOrderBy, QueryState } from "@my-issue-tracker/frontend/src/utils/QuerySchema"

config()//dotnev

const taskRoute = Router()

const ISSUE_TRACKER_USERNAME = process.env.ISSUE_TRACKER_USERNAME
const ISSUE_TRACKER_REPO_NAME = process.env.ISSUE_TRACKER_REPO_NAME;

taskRoute.post("/select",async (req,res)=>{

    const GITHUB_LIST_ISSUE_URL = `https://api.github.com/repos/${ISSUE_TRACKER_USERNAME}/${ISSUE_TRACKER_REPO_NAME}/issues`

    console.log("=============================================================")
    console.log(req.body.data);
    console.log("=============================================================")
    const {token,state: _state,_contain,_pagesize,query_page,_orderby} = req.body.data;

    console.log(`query_state : ${_state}`);
    const query_state     = _state   !== undefined ? _state   : QueryState.All;
    const query_contain   = _contain !== undefined ? _contain : "";
    const query_pagesize  = _pagesize!== undefined ? _pagesize : 10;
    const query_orderby   = _orderby !== undefined ? _orderby : QueryOrderBy.CreateTime;

    const getQueryLabel = () => {
        switch(query_state){
            case QueryState.All         : { return undefined };
            case QueryState.Open        : { return undefined };
            case QueryState.InProcess   : { return "inprocess" };
            case QueryState.Done        : { return "done" };
            default                     : { return undefined };
        }
    }

    const QueryState2filterStateType = (state:QueryState) => {
        switch(state){
            case QueryState.All         : { return filterStateType.all };
            case QueryState.Open        : { return filterStateType.open };
            case QueryState.InProcess   : { return filterStateType.inprocess };
            case QueryState.Done        : { return filterStateType.done };
            default                     : { return filterStateType.error }
        }
    }

    const queryOption = {
        labels      : getQueryLabel(),
        per_page    : query_pagesize,
        page        : query_page
    }
    const qstring = qs.stringify(queryOption,{ arrayFormat: 'comma' });
    console.log(qstring)

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

    const list : TaskEntryType[] = []
    rtv.data.map((item: queryIssueType) => {
        // console.log(item.title,item.body)

        const getItemState = () => {
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
        // if(getItemState() === state || state === filterStateType.all)
        if(getItemState() == QueryState2filterStateType(query_state) || query_state == QueryState.All)
            list.push({ 
                index : item.number,
                title : item.title, 
                body: item.body, 
                state : getItemState()
            } as TaskEntryType)
    });
    // const listLength = list.length
    // for (let idx = 0; idx < 10 - listLength - 1; idx++) {
    //     list.push({ title : `Query ${idx} title`, body: `Query body`, state : filterStateType.open } as TaskEntryType)
    // }
    // console.log("Current Queue : ",page)
    console.log(list)

    console.log("===========================FINISH SELECT===========================")

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