import React, { useCallback, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import TasksPage from "./pages/tasks/tasks";
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
                        <Route path="/" element={<LoginPage updateGithubAuth={updateGithubClient}/>}/>{/* Move validation to standalone page */}
                        <Route path="/authed" element={<LoginPage updateGithubAuth={updateGithubClient}/>}/>{/* Get token */}
                        <Route path="/tasks" element={<TasksPage/>}/>{/* List issues */}
                    </Routes>
                </BrowserRouter>
            </GitHubClientContext.Provider>
        </>
    );
}

export default App;
