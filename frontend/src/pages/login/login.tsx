import React, { useEffect } from "react";
import Button from "react-bootstrap/Button";
import { propTypes } from "react-bootstrap/esm/Image";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthTokenType, useGitHub } from "../../utils/github";

export type LoginPageProps = {
    children? : React.ReactNode
}

function LoginPage(props: LoginPageProps) {
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
        else {
            setTimeout(() => githubClient.Login(),2000)
        }
    },[currentUrlParams])

    return (
        <div className="d-flex justify-content-center h-100">
            {/* <Button onClick={() => githubClient.Login()}>GitHub Login</Button> */}
            <div className="d-flex flex-column justify-content-center">
                <div className="align-self-center">
                    <div className="spinner-border text-primary" role="status"/>
                </div>
                {props.children}
            </div>
            
        </div>
    );
}

export default LoginPage;
