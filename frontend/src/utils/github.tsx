import React, { useContext, useEffect, useState } from "react";
import qs from "qs";
import axios from "axios";
import { TaskEntryType } from "@my-issue-tracker/backend/taskType"
import { defaultQueryProps, filterStateType, QueryOrder, QuerySchema, QueryState } from "./QuerySchema";

export type AuthTokenType = {
    access_token: string;
    scope: string;
    token_type: string;
}; 
type GitHubClientContextType = {
    Login : () => void,// Login GitHub to get 'code'
    GetAccessToken : (code : string) => Promise<void>, // Use previous 'code' to get access token
    QueryTask : (startIndex : number,endIndex: number) => Promise<void>, // Query a page of task and stored in context,
    QueryProp : QuerySchema, // Current Query task 
    SetQueryProp : (query : QuerySchema) => void,
    TaskCount : number, // Total Loaded Tasks
    TotalTaskCount : number, // Total Loaded Tasks
    PageCount : number, // Total Loaded Pages
    TotalPageCount : number,
    GetTask : (index : number) => TaskEntryType, // Get Task of index
    SetTask : (index : number, newValue : TaskEntryType) => void, // Update a Task of index
    DeleteTask : (index : number) => void, // Delete a Task of index
    CreateTask : (newValue: TaskEntryType) => void,
    LastErrorMessage : string,
};
const GitHubClientContext = React.createContext({} as GitHubClientContextType);
export const useGitHub = () => useContext(GitHubClientContext)

export type GitHubClientPropsType = {
    client_id   : string,
    backend_address : string,
    children    : React.ReactNode
}

type TaskPageType = {
    list : TaskEntryType[]
}
type TaskListType = {[pageIdx:number]:TaskPageType};

function GitHubClent(props : GitHubClientPropsType) {

    const PAGE_SIZE = 10;

    const [authToken, setAuthToken] = useState({} as AuthTokenType);

    const [taskList,setTaskList] = useState({} as TaskListType);
    const [taskCount,setTaskCount] = useState(0);
    const [totalPageCount,setTotalPageCount] = useState(1);

    const [queryProps, setQueryProps] = useState(defaultQueryProps);

    const [errorMsg,setErrorMsg] = useState("");

    const [canLoadMoreData,setCanLoadMoreData] = useState(true);

    const processError = (error: string) => {
        setErrorMsg(error);
        throw new Error(error);
    }

    // console.log(taskList);

    const clientLogin = () => {
        try {
            const GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize";
            const GITHUB_CLIENT_ID = props.client_id;
            const GITHUB_AUTH_SCOPE = ["user", "repo"];
        
            const queryOption = {
                client_id : GITHUB_CLIENT_ID,
                scope : GITHUB_AUTH_SCOPE
            }
            const qstring = qs.stringify(queryOption,{ arrayFormat: 'comma' });
        
            const loginUri = `${GITHUB_AUTH_URL}?${qstring}`
            // console.log(loginUri);
            window.location.href = loginUri;
        } catch (error) {
            processError("Something error when logining, try to login again")
        }
    };

    const clientGetAccessToken = async (code : string) => {
        try {
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
            // console.log("getAuthToken", data);
            setAuthToken(data);
            return;
        } catch (error) {
            processError("Something error when logining, try to login again")
        }
    }

    const clearTaskList = () => {
        setTaskList({});
        setTaskCount(0);
        setTotalPageCount(1);
        setCanLoadMoreData(true);
    }

    const clientSetQueryProp = async (query: QuerySchema) => {
        try {
            const query_state     = query.state   !== undefined ? query.state   : QueryState.All;
            const query_contain   = query.contain !== undefined ? query.contain : "";
            const query_order     = query.order   !== undefined ? query.order   : QueryOrder.NewerFirst;
            
            // console.log(query_state,queryProps.state)
            // console.log(`Change task state from ${queryProps.state} to ${query_state}`)
            
            // console.log(query_state , queryProps.state) // &&
            // console.log(query_contain , queryProps.contain) // &&
            // console.log(query_order , queryProps.order) // &&
            // console.log(query_orderby , queryProps.orderby) //
            const QueryNotChanged = query_state === queryProps.state &&
                                    query_contain === queryProps.contain &&
                                    query_order === queryProps.order

            const fullQuery : QuerySchema = {
                state       : query_state,
                contain     : query_contain,
                order       : query_order,
            }

            if(!QueryNotChanged){
                setQueryProps(fullQuery);
                // console.log("Remove TaskList")
                clearTaskList()
                // await clientQueryTask(0);
            }
        } catch (error) {
            processError("Something error when update query, try to login again")
        }
    }

    

    const clientQueryTask = async (startIndex: number, endIndex: number) => {
        try {
            const selectAddress = `${props.backend_address}/api/task/select`;
            // TODO : validate
            const page = startIndex / PAGE_SIZE
            // console.log(`Query page ${page} with schema`,queryProps);
            
            const query_state     = queryProps.state   ;
            const query_contain   = queryProps.contain ;
            const query_order     = queryProps.order   ;
            // clientSetQueryProp(query)
            
            let newList : TaskListType = {...taskList};
            // `/api/issue/select/` : {
            //     token      : string,
            //     state      : ['open','inprocess','done','deleted'], (1 to more)
            //     contain    : string,
            //     pagesizw   : number,
            //     page       : number,
            //     orderby    : ['title','createtime','body']
            //     order      : ['desc','asc']
            // }
            const {data,status} = await axios.post(selectAddress,{
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                data: {
                    token      : authToken.access_token,
                    state      : query_state,
                    contain    : query_contain,
                    pagesize   : PAGE_SIZE,
                    page       : page + 1,
                    order      : query_order,
                }
            });
            // console.log("select status : ", status);
            // console.log("select result : ", data);

            // const list = []
            if(data.length > 0){
                newList[page] = {
                    list : data
                }
                setTaskList(newList);
            }
            if(data.length < PAGE_SIZE)//Last page
                setCanLoadMoreData(false);
            setTotalPageCount(Object.keys(taskList).length + (data.length < PAGE_SIZE ? 0 : 1))
            setTaskCount(taskCount + data.length);
        } catch (error) {
            processError("Something error when query tasks, try to login again")
        }
    }

    useEffect(() => {
        const updateQuery = async () => {
            if(authToken.access_token !== undefined)
                if(taskCount === 0)
                    await clientQueryTask(0,10);
        }
        updateQuery()
    },[queryProps,taskCount,authToken.access_token])

    const clientGetTask = (index : number) : TaskEntryType => {
        //TODO : check if task loaded
        const page = Math.floor(index / PAGE_SIZE);// + (index % PAGE_SIZE !== 0 ? 1 : 0);
        // console.log(`Get task ${index} at Page ${page}`);
        if(!(page in taskList))
            return { 
                index : -1,
                title : "Error",
                body  : `Page ${page} is not exist`,
                state : filterStateType.error
            };
        if(taskList[page].list.length < index % PAGE_SIZE)
            return {
                index: -1,
                title : "Error",
                body : `Task ${index} is not exist`,
                state : filterStateType.error
            }
        return taskList[page].list[index % PAGE_SIZE]

    };

    const clientSetTask  = async (index : number, newValue : TaskEntryType) => {
        try {
            const setAddress = `${props.backend_address}/api/task/update`;
            // console.log(`Set task ${index}`);
            const page = Math.floor(index / PAGE_SIZE);// + (index % PAGE_SIZE !== 0 ? 1 : 0);
            if(!(page in taskList))
                processError("Task is not exist");
            
            if(newValue.body.split(/\s+/).length <= 30)
                processError("Content too short. Must longer than 30 words.");
                

            // `/api/task/update` : {
            //     id          : number,
            //     title       : string,
            //     state       : ['open','inprocess','done'],
            //     body        : string
            // }
            let newTaskList = {...taskList}
            newTaskList[page].list[index % PAGE_SIZE] = {...newValue};
            setTaskList(newTaskList);

            const {data} = await axios.patch(setAddress,{
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                data: {
                    token       : authToken.access_token,
                    id          : taskList[page].list[index % PAGE_SIZE].index,
                    title       : newValue.title,
                    state       : newValue.state,
                    body        : newValue.body,
                }
            });
            // console.log("update result : ", data);
            clearTaskList(); // Force update
        } catch (error) {
            processError("Something error when update task, try to login again")
        }            
    }

    const clientDeleteTask = async (index : number) => {
        try {
            const deleteAddress = `${props.backend_address}/api/task/delete`;
            const page = Math.floor(index / PAGE_SIZE);// + (index % PAGE_SIZE !== 0 ? 1 : 0);
            if(!(page in taskList))
                processError("Page is not exist");
            if(taskList[page].list.length < index % PAGE_SIZE)
                processError("Task is not exist");

            // `/api/task/delete` : {
            //     id          : number
            // }
            const {data} = await axios.delete(deleteAddress,{
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                data: {
                    token       : authToken.access_token,
                    id          : taskList[page].list[index % PAGE_SIZE].index,
                }
            });
            // console.log(`Deleting ${taskList[page].list[index % PAGE_SIZE].index}`)
            // console.log("delete result : ", data);
            clearTaskList() // Force update
        } catch (error) {
            // console.log(error)
            processError("Something error when delete task, try to login again")
        }
    };

    const clientCreateTask  = async (newValue : TaskEntryType) => {
        try {
            const createAddress = `${props.backend_address}/api/task/create`;

            // console.log("newValue");
            // console.log(newValue);

            if(newValue.title.length === 0)
                processError("Title is required.")
            
            if(newValue.body.split(/\s+/).length <= 30)
                processError("Content too short. Must longer than 30 words.");
                
            // `/api/task/create` : {
            //     title       : string,
            //     state       : ['open','inprocess','done'],
            //     body        : string
            // }
            // TODO : Update TaskList
            const {data} = await axios.post(createAddress,{
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                data: {
                    token       : authToken.access_token,
                    title       : newValue.title,
                    state       : newValue.state,
                    body        : newValue.body,
                }
            });
            // console.log("create result : ", data);
            clearTaskList(); // Force reload
        } catch (error) {
            // console.log(error);
            processError("Something error when create task, try to login again")
            
        }  
    }

    // console.log("canLoadMoreData" , canLoadMoreData)
    return <>
        <GitHubClientContext.Provider value={{
            // Auth
            Login : clientLogin,
            GetAccessToken : clientGetAccessToken,

            // Load Tasks
            QueryTask : clientQueryTask,
            QueryProp : queryProps,
            SetQueryProp : clientSetQueryProp,
            TaskCount : taskCount  ,
            TotalTaskCount : taskCount + (canLoadMoreData ? 1 : 0),
            PageCount : Object.keys(taskList).length,//TODO support partial load
            TotalPageCount : totalPageCount,
            // Single task manager
            GetTask : clientGetTask,
            SetTask : clientSetTask,
            DeleteTask : clientDeleteTask,
            CreateTask : clientCreateTask,
            //Error message
            LastErrorMessage : errorMsg,
        }}>
            {props.children}
        </GitHubClientContext.Provider>
    </>;
}

export default GitHubClent;
