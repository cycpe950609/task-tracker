import React, { useEffect } from "react";
import Button from "react-bootstrap/Button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthTokenType, useGitHub } from "../../utils/github";

function LoginPage() {
    // Check if login
    const [currentUrlParams,setCurrentUrlParams] = useSearchParams();
    const navigate = useNavigate();
    const githubClient = useGitHub();
    console.log(currentUrlParams);
    useEffect(()=>{
        if (currentUrlParams.has("code")) {
            // Loginned
            const authCode = currentUrlParams.get("code");
            if (authCode === null)
                throw new Error("Something Error when getting authorication");

            githubClient.GetAccessToken(authCode)
            .then(() => {
                currentUrlParams.delete("code");
                setCurrentUrlParams(currentUrlParams);
                navigate("/tasks");
            })
        }
    },[currentUrlParams])

    return (
        <div>
            <Button onClick={() => githubClient.Login()}>GitHub Login</Button>
        </div>
    );
}

export default LoginPage;
