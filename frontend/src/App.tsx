import React, { useCallback, useState } from "react";
import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom";
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
    const updateGithubClient = useCallback((authKey: string) => {
        setGithubClient({
            authKey: authKey
        });
    },[setGithubClient]);
    return (
        <>
            <GitHubClientContext.Provider value={githubClient}>
                {/* prettier-ignore */}
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<LoginPage updateGithubAuth={updateGithubClient}/>}>
                            <Route path="authed" element={<LoginPage updateGithubAuth={updateGithubClient}/>}/>
                        </Route>
                    </Routes>
                </BrowserRouter>
            </GitHubClientContext.Provider>
        </>
    );
}

export default App;
