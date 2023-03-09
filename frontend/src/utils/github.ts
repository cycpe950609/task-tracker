import React, { useContext } from "react";

export function login() {
    const GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize";
    const GITHUB_CLIENT_ID = process.env.REACT_APP_GITHUB_CLIENT_ID;
    const GITHUB_AUTH_SCOPE = ["user", "repo"];

    const loginUri = encodeURI(
        `${GITHUB_AUTH_URL}?client_id=${GITHUB_CLIENT_ID}&scope=${GITHUB_AUTH_SCOPE}`
    );
    window.location.href = loginUri;
}

export type AuthTokenType = {
    access_token: string;
    scope: string;
    token_type: string;
};
export async function getAuthToken(code: string) {
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
    const BACKEND_PORT = process.env.REACT_APP_BACKEND_PORT;
    const authAddress = `${BACKEND_URL}:${BACKEND_PORT}/api/auth/getToken`;
    // console.log(authAddress);
    const res = await fetch(authAddress,{
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            code : code
        })
    });
    console.log("getAuthToken", res);

}

type GitHubClientContextType = {
    authKey: string;
};

export const defaultGitHubClientContext: GitHubClientContextType = {
    authKey: ""
};
export const GitHubClientContext = React.createContext<GitHubClientContextType>(
    defaultGitHubClientContext
);

export const useAuthKey = () => useContext(GitHubClientContext).authKey;
