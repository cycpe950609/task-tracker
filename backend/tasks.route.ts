import { config } from 'dotenv';
import { query, Router } from "express";
import qs from "qs";
import axios from "axios";
import { TaskEntryType } from "./taskType";
import { filterStateType, QueryOrder, QueryState } from "@my-issue-tracker/frontend/src/utils/QuerySchema"

config()//dotnev

const taskRoute = Router()

const ISSUE_TRACKER_USERNAME = process.env.ISSUE_TRACKER_USERNAME
const ISSUE_TRACKER_REPO_NAME = process.env.ISSUE_TRACKER_REPO_NAME;

const getQueryLabel = (query_state: QueryState) => {
    switch(query_state){
        case QueryState.All         : { return undefined };
        case QueryState.Open        : { return undefined };
        case QueryState.InProcess   : { return "inprocess" };
        case QueryState.Done        : { return "done" };
        default                     : { return undefined };
    }
}

const ListIssues = async (token:string,state: QueryState,pageSize: number,page: number,order: QueryOrder) => {
    const GITHUB_LIST_ISSUE_URL = `https://api.github.com/repos/${ISSUE_TRACKER_USERNAME}/${ISSUE_TRACKER_REPO_NAME}/issues`;

    console.log("===========================LIST ISSUES===========================");
    const queryOption = {
        labels      : getQueryLabel(state),
        per_page    : pageSize,
        page        : page,
        sort        : "created",
        direction   : order
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
    console.log("=========================LIST ISSUES END=========================");
    return rtv.data;
}
const SearchIssues = async (token:string,state: QueryState,pageSize: number,page: number,order: QueryOrder,contain: string) =>{
    console.log("===========================SEARCH ISSUES===========================");
    const GITHUB_SEARCH_ISSUE_URL = `https://api.github.com/search/issues`
    const qArgs = {
        "is"        : "issue",
        "in"        : "body",
        "repo"      : `${ISSUE_TRACKER_USERNAME}/${ISSUE_TRACKER_REPO_NAME}`,
        "state"     : "open",
        "label"    : getQueryLabel(state),

    } as {[key:string]:string}
    let qstring : string = `"${contain.replace(/"/g,'\\"')}" `;
    Object.keys(qArgs).map((val)=>{
        if(qArgs[val] !== undefined)
            qstring += `${val}:${qArgs[val]} `
    })
    console.log(qstring)
    const queryOption = {
        q           : qstring,
        per_page    : pageSize,
        page        : page,
        sort        : "created",
        order       : order
    }
    const queryString = qs.stringify(queryOption,{ arrayFormat: 'comma' });
    console.log(queryString)

    const selectUri = `${GITHUB_SEARCH_ISSUE_URL}?${queryString}`
    

    const rtv = await axios.get(selectUri,{
        headers : {
            "Accept" : "application/vnd.github+json",
            "Authorization" : `Bearer ${token}`,
            "X-GitHub-Api-Version" : "2022-11-28"
        }
    })
    console.log("=========================SEARCH ISSUES END=========================");
    return rtv.data.items;
}

taskRoute.post("/select",async (req,res,next)=>{

    console.log("=============================================================")
    console.log(req.body.data);
    console.log("=============================================================")
    const {token,state: _state,contain: _contain,pagesize: _pagesize,page: query_page,order: _order} = req.body.data;

    if(token == undefined)
        return res.status(401).send("")

    const query_state     = _state   !== undefined ? _state   : QueryState.All;
    const query_contain   = _contain !== undefined ? _contain : "";
    const query_pagesize  = _pagesize!== undefined ? _pagesize : 10;
    const query_order     = _order !== undefined ? _order : QueryOrder.NewerFirst;
    console.log(`query_state : ${query_state} , query_order : ${query_order}`);

    

    const QueryState2filterStateType = (state:QueryState) => {
        switch(state){
            case QueryState.All         : { return filterStateType.all };
            case QueryState.Open        : { return filterStateType.open };
            case QueryState.InProcess   : { return filterStateType.inprocess };
            case QueryState.Done        : { return filterStateType.done };
            default                     : { return filterStateType.error }
        }
    }

    const rtvLst = (query_contain.length > 0) ?     await SearchIssues(token,query_state,query_pagesize,query_page,query_order,query_contain) : 
                                                    await ListIssues(token,query_state,query_pagesize,query_page,query_order)
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
    rtvLst.map((item: queryIssueType) => {
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
            return filterStateType.error;
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

    console.log(list)

    console.log("===========================FINISH SELECT===========================")

    if(list.length == 0)
        return res.status(204).send("")

    return res.send(JSON.stringify(list));
})

taskRoute.post("/create",async (req,res)=>{

    const GITHUB_CREATE_ISSUE_URL = `https://api.github.com/repos/${ISSUE_TRACKER_USERNAME}/${ISSUE_TRACKER_REPO_NAME}/issues`

    console.log(req.body.data);

    const {token,state: _state,title: _title,body: _body} = req.body.data;

    if(token == undefined)
        return res.status(401).send("")
    if(_title.length === 0)
        res.status(400).send("Title is required.")
    if(_body.split(/\s+/).length < 30)
        res.status(400).send("Content too short. Must longer than 30 words.");

    const getQueryLabel = (query_state : filterStateType) => {
        switch(query_state){
            case filterStateType.all            : { return [] };
            case filterStateType.open           : { return [] };
            case filterStateType.inprocess      : { return ["inprocess"] };
            case filterStateType.done           : { return ["done"] };
            default                             : { return [] };
        }
    }

    const createOption = {
        title       : _title,
        body        : _body,
        labels      : getQueryLabel(_state)
    }

    const rtv = await axios.post(GITHUB_CREATE_ISSUE_URL, JSON.stringify(createOption),{
        headers : {
            "Accept" : "application/vnd.github+json",
            "Authorization" : `Bearer ${token}`,
            "X-GitHub-Api-Version" : "2022-11-28",
            'Content-Type':'application/x-www-form-urlencoded'
        },
    })

    console.log(createOption)

    return res.send("create success")
})

taskRoute.patch("/update",async (req,res)=>{
    const GITHUB_UPDATE_ISSUE_URL = `https://api.github.com/repos/${ISSUE_TRACKER_USERNAME}/${ISSUE_TRACKER_REPO_NAME}/issues`

    // console.log(req);

    const {token,id,state: _state,title: _title,body: _body} = req.body.data;

    if(token == undefined)
        return res.status(401).send("")
    if(_title.length === 0)
        res.status(400).send("Title is required.")
    if(_body.split(/\s+/).length < 30)
        res.status(400).send("Content too short. Must longer than 30 words.");
    
    const updateUrl = `${GITHUB_UPDATE_ISSUE_URL}/${id}`

    const getQueryLabel = (query_state : filterStateType) => {
        switch(query_state){
            case filterStateType.all            : { return [] };
            case filterStateType.open           : { return [] };
            case filterStateType.inprocess      : { return ["inprocess"] };
            case filterStateType.done           : { return ["done"] };
            default                             : { return [] };
        }
    }

    const updateOption = {
        title       : _title,
        body        : _body,
        labels      : getQueryLabel(_state)
    }

    const rtv = await axios.patch(updateUrl, JSON.stringify(updateOption),{
        headers : {
            "Accept" : "application/vnd.github+json",
            "Authorization" : `Bearer ${token}`,
            "X-GitHub-Api-Version" : "2022-11-28",
            'Content-Type':'application/x-www-form-urlencoded'
        },
    })

    return res.send("update")
})

taskRoute.delete("/delete",async (req,res)=>{
    
    const GITHUB_DELETE_ISSUE_URL = `https://api.github.com/repos/${ISSUE_TRACKER_USERNAME}/${ISSUE_TRACKER_REPO_NAME}/issues`

    // console.log(req);

    const {token,id} = req.body;

    if(token == undefined)
        return res.status(401).send("")
    
    const deleteUrl = `${GITHUB_DELETE_ISSUE_URL}/${id}`
    // console.log(deleteUrl)

    const rtv = await axios.patch(deleteUrl, JSON.stringify({"state": "closed"}),{
        headers : {
            "Accept" : "application/vnd.github+json",
            "Authorization" : `Bearer ${token}`,
            "X-GitHub-Api-Version" : "2022-11-28",
            'Content-Type':'application/x-www-form-urlencoded'
        },
    })

    return res.send("delete success")
})



export default taskRoute;