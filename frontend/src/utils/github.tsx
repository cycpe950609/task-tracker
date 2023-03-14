import React, { useCallback, useContext, useState } from "react";
import qs from "qs";
import axios from "axios";



export enum filterStateType  {
    open = "Open",
    inprocess = "In-Process",
    done = "Done",
    all = "All",
    error = "Error",
    loaded = "Loaded",
}
export type TaskEntryType = {
    title : string,
    body : string,
    state : filterStateType,
}
export type AuthTokenType = {
    access_token: string;
    scope: string;
    token_type: string;
}; 
type GitHubClientContextType = {
    Login : () => void,// Login GitHub to get 'code'
    GetAccessToken : (code : string) => Promise<void>, // Use previous 'code' to get access token
    QueryTask : (query : QuerySchema,page : number) => Promise<void>, // Query a page of task and stored in context,
    QueryProp : QuerySchema, // Current Query task 
    TaskCount : number, // Total Loaded Tasks
    TotalTaskCount : number, // Total Loaded Tasks
    PageCount : number, // Total Loaded Pages
    TotalPageCount : number,
    GetTask : (index : number) => TaskEntryType, // Get Task of index
    SetTask : (index : number, newValue : TaskEntryType) => void, // Update a Task of index
    DeleteTask : (index : number) => void, // Delete a Task of index
    
};
const GitHubClientContext = React.createContext({} as GitHubClientContextType);
export const useGitHub = () => useContext(GitHubClientContext)

export type GitHubClientPropsType = {
    client_id   : string,
    backend_address : string,
    queryPageSize?   : number,
    children    : React.ReactNode
}

export enum QueryState {
    Open = "open",
    InProcess = "inprocess",
    Done = "done",
    Deleted = "deleted"
}
export enum QueryOrderBy {
    Title = "title",
    CreateTime = "createtime",
    Body = "body",
}
export enum QueryOrder {
    Ascend = "asc",
    Descend = "desc"
}

export type QuerySchema = {
    state?      : QueryState[]
    contain?    : string,
    orderby?    : QueryOrderBy
    order?      : QueryOrder,
}
type ServerQuerySchemaExtention = {
    start       : number,
    end?        : number,
};

type ServerQuerySchema = QuerySchema & ServerQuerySchemaExtention;

type TaskPageType = {
    list : TaskEntryType[]
}
type TaskListType = {[pageIdx:number]:TaskPageType};

function GitHubClent(props : GitHubClientPropsType) {

    const PAGE_SIZE = props.queryPageSize !== undefined ? props.queryPageSize : 10;

    const [authToken, setAuthToken] = useState({} as AuthTokenType);

    const [taskList,setTaskList] = useState({} as TaskListType);
    const [taskCount,setTaskCount] = useState(0);
    const [totalTaskCount,setTotalTaskCount] = useState(10*PAGE_SIZE);
    const [totalPageCount,setTotalPageCount] = useState(10);

    const [srvQueryProps, setSrvQueryProps] = useState({start : 0 } as ServerQuerySchemaExtention);
    const [queryProps, setQueryProps] = useState({} as QuerySchema);

    const clientLogin = () => {
        const GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize";
        const GITHUB_CLIENT_ID = props.client_id;
        const GITHUB_AUTH_SCOPE = ["user", "repo"];
    
        const queryOption = {
            client_id : GITHUB_CLIENT_ID,
            scope : GITHUB_AUTH_SCOPE
        }
        const qstring = qs.stringify(queryOption,{ arrayFormat: 'comma' });
    
        const loginUri = `${GITHUB_AUTH_URL}?${qstring}`
        console.log(loginUri);
        window.location.href = loginUri;
    };

    const clientGetAccessToken = async (code : string) => {
        const authAddress = `${props.backend_address}/api/auth/getToken`;
        // console.log(authAddress);
        const {data} = await axios.post(authAddress,{
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            data: {
                code : code
            }
        });
        console.log("getAuthToken", data);
        setAuthToken(data);
        return;
    }

    const clientQueryTask = async (query : QuerySchema,page : number) => {
        // TODO : validate
        console.log(`Query page ${page} with schema`,query);
        const query_state     = query.state   !== undefined ? query.state   : [QueryState.Open,QueryState.InProcess,QueryState.Done];
        const query_contain   = query.contain !== undefined ? query.contain : "";
        const query_orderby   = query.orderby !== undefined ? query.orderby : QueryOrderBy.CreateTime;
        const query_order     = query.order   !== undefined ? query.order   : QueryOrder.Descend;
        const QueryNotChanged  = query_state === queryProps.state &&
                                query_contain === queryProps.contain &&
                                query_order === queryProps.order &&
                                query_orderby === queryProps.orderby
        setQueryProps(query);

        if(!QueryNotChanged)
            setTaskList({});
        
        let newList : TaskListType = {...taskList};
        const list = [];
        for (let idx = 0; idx < PAGE_SIZE; idx++) {
            list.push({ title : `Page ${page} ${idx + 1} title`, body: `Page ${page} ${idx + 1} body`, state : filterStateType.open } as TaskEntryType)
        }
        newList[page] = {
            list : list
        }
        setTaskList(newList);
        setTaskCount(taskCount + list.length);
    }

    const clientGetTask = (index : number) : TaskEntryType => {
        //TODO : check if task loaded
        const page = Math.floor(index / PAGE_SIZE);// + (index % PAGE_SIZE !== 0 ? 1 : 0);
        // console.log(`Get task ${index} at Page ${page}`);
        if(!(page in taskList))
            return { 
                title : "Error",
                body  : `Page ${page} is not exist`,
                state : filterStateType.error
            };
        if(taskList[page].list.length < index % PAGE_SIZE)
            return {
                title : "Error",
                body : `Task ${index} is not exist`,
                state : filterStateType.error
            }
        return taskList[page].list[index % PAGE_SIZE]
    };

    const clientSetTask  = (index : number, newValue : TaskEntryType) => {
        console.log(`Set task ${index}`);
        const page = index / PAGE_SIZE + (index % PAGE_SIZE !== 0 ? 1 : 0);
        if(!(page in taskList))
            throw new Error("Task is not exist");
        
            
    }

    const clientDeleteTask = (index : number) => {

    };

    const canLoadMoreData =  Object.keys(taskList).length < totalPageCount;

    return <>
        <GitHubClientContext.Provider value={{
            // Auth
            Login : clientLogin,
            GetAccessToken : clientGetAccessToken,

            // Load Tasks
            QueryTask : clientQueryTask,
            QueryProp : queryProps,
            TaskCount : taskCount + (canLoadMoreData ? 1 : 0) ,
            TotalTaskCount : totalPageCount,
            PageCount : Object.keys(taskList).length,//TODO support partial load
            TotalPageCount : totalPageCount,
            // Single task manager
            GetTask : clientGetTask,
            SetTask : clientSetTask,
            DeleteTask : clientDeleteTask,
        }}>
            {props.children}
        </GitHubClientContext.Provider>
    </>;
}

export default GitHubClent;