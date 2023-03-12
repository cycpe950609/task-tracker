import React, { useCallback, useContext, useState } from "react";
import qs from "qs";
import axios from "axios";



export enum filterStateType  {
    open = "Open",
    inprocess = "In-Process",
    done = "Done",
    all = "all"

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
    Login : () => void,
    GetAccessToken : (code : string) => Promise<void>,
};
const GitHubClientContext = React.createContext({} as GitHubClientContextType);
export const useGitHub = () => useContext(GitHubClientContext)

export type GitHubClientPropsType = {
    client_id   : string,
    backend_address : string,
    children    : React.ReactNode
}
function GitHubClent(props : GitHubClientPropsType) {
    const [taskList,setTaskList] = useState([] as TaskEntryType[])
    const [authToken, setAuthToken] = useState({} as AuthTokenType);

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

    return <>
        <GitHubClientContext.Provider value={{
            Login : clientLogin,
            GetAccessToken : clientGetAccessToken
        }}>
            {props.children}
        </GitHubClientContext.Provider>
    </>;
}

export default GitHubClent;
