import React, { useCallback, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import TasksPage from "./pages/tasks/tasks";
import LoginPage from "./pages/login/login";
import GitHubClent from "./utils/github";

function App() {

    const CLIENT_ID = process.env.REACT_APP_GITHUB_CLIENT_ID;
    if(CLIENT_ID === undefined)
        throw new Error("Cant get client id of GitHub app");
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
    if(BACKEND_URL === undefined)
        throw new Error("Cant get server address");
    const BACKEND_PORT = process.env.REACT_APP_BACKEND_PORT;
    if(BACKEND_PORT === undefined)
        throw new Error("Cant get server address");
    const BACKEND_ADDRESS = `${BACKEND_URL}:${BACKEND_PORT}`;
    return (
        <>
            <GitHubClent client_id={CLIENT_ID} backend_address={BACKEND_ADDRESS}>
                {/* prettier-ignore */}
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<LoginPage><span>Login in 2 seconds...</span></LoginPage>}/>{/* Move validation to standalone page */}
                        <Route path="/authed" element={<LoginPage><span>Process login...</span></LoginPage>}/>{/* Get token */}
                        <Route path="/tasks" element={<TasksPage/>}/>{/* List issues */}
                    </Routes>
                </BrowserRouter>
            </GitHubClent>
        </>
    );
}

export default App;
