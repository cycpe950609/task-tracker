import React, { useEffect } from "react";
import Button from "react-bootstrap/Button";
import { propTypes } from "react-bootstrap/esm/Image";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthTokenType, useGitHub } from "../../utils/github";

export type ProcessPageProps = {
    children? : React.ReactNode
}

function ProcessPage(props : ProcessPageProps){
    return <>
        <div className="d-flex justify-content-center h-100">
            {/* <Button onClick={() => githubClient.Login()}>GitHub Login</Button> */}
            <div className="d-flex flex-column justify-content-center">
                <div className="align-self-center">
                    <div className="spinner-border text-primary" role="status"/>
                </div>
                {props.children}
            </div>
        </div>
    </>
}

export function LoginPage() {
    // Check if login
    const githubClient = useGitHub();
    useEffect(()=>{
        setTimeout(() => githubClient.Login(),2000)
    },[])

    const getMessage = () => {
        if(githubClient.LastErrorMessage !== "")
            return <span style={{color: 'red'}}>{githubClient.LastErrorMessage}</span> 
        return <span>Login in 2 seconds ...</span>;
    }

    return (
        <ProcessPage>
            {getMessage()}
        </ProcessPage>
    );
}

export function AuthPage(){
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
        <ProcessPage>
            <span>Process Login ...</span>
        </ProcessPage>
    );
}
