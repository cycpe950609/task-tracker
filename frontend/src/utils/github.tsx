import React, { useCallback, useContext, useState } from "react";
import qs from "qs";
import axios from "axios";



export enum filterStateType  {
    open = "Open",
    inprocess = "In-Process",
    done = "Done",
    all = "All"

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
    CountTask : number, // Total Loaded Tasks
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
    const [totalPageCount,setTotalPageCount] = useState(0);

    const [srvQueryProps, setSrvQueryProps] = useState({start : 0 } as ServerQuerySchemaExtention);
    const [queryProps, setQueryProps] = useState({} as QuerySchema);

    const clientLogin = useCallback(() => {
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
    },[props.client_id]);

    const clientGetAccessToken = useCallback( async (code : string) => {
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
    },[props.backend_address])

    const clientQueryTask = useCallback( async (query : QuerySchema,page : number) => {
        // TODO : validate
        setQueryProps(query);
        
    },[])

    const clientGetTask = useCallback((index : number) => {
        //TODO : check if task loaded
        return {
            title : "Task",
            body : "Body",
            state : filterStateType.done,
        } as TaskEntryType
    },[]);

    const clientSetTask  = useCallback((index : number, newValue : TaskEntryType) => {

    },[])

    const clientDeleteTask = useCallback((index : number) => {

    },[]);

    return <>
        <GitHubClientContext.Provider value={{
            Login : clientLogin,
            GetAccessToken : clientGetAccessToken,
            QueryTask : clientQueryTask,
            QueryProp : queryProps,
            CountTask : taskCount,
            PageCount : Object.keys(taskList).length,//TODO support partial load
            TotalPageCount : totalPageCount,
            GetTask : clientGetTask,
            SetTask : clientSetTask,
            DeleteTask : clientDeleteTask,
        }}>
            {props.children}
        </GitHubClientContext.Provider>
    </>;
}

export default GitHubClent;
