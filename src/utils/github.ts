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
export function getAuthToken(code: string) {
    return fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            client_id: process.env.REACT_APP_GITHUB_CLIENT_ID,
            client_secret: process.env.REACT_APP_GITHUB_CLIENT_SECRET,
            code
        })
    }).then((res) => res.json());
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
