import React, { useState } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/login/login";
import {
    defaultGitHubClientContext,
    GitHubClientContext
} from "./utils/github";

function App() {
    const [githubClient, setGithubClient] = useState(
        defaultGitHubClientContext
    );
    const updateGithubClient = (authKey: string) => {
        setGithubClient({
            authKey: authKey
        });
    };
    return (
        <>
            <GitHubClientContext.Provider value={githubClient}>
                {/* prettier-ignore */}
                <HashRouter>
                    <Routes>
                        <Route path="/" element={<LoginPage updateGithubAuth={updateGithubClient}/>}>

                        </Route>
                    </Routes>
                </HashRouter>
            </GitHubClientContext.Provider>
        </>
    );
}

export default App;
