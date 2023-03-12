import React, { useEffect } from "react";
import Button from "react-bootstrap/Button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthTokenType, getAuthToken, login } from "../../utils/github";
export type LoginPagePropsType = {
    updateGithubAuth: (authCode: string) => void;
};
function LoginPage(props: LoginPagePropsType) {
    // Check if login
    const [currentUrlParams,setCurrentUrlParams] = useSearchParams();
    const navigate = useNavigate();
    console.log(currentUrlParams);
    useEffect(()=>{
        if (currentUrlParams.has("code")) {
            // Loginned
            const authCode = currentUrlParams.get("code");
            if (authCode === null)
                throw new Error("Something Error when getting authorication");

            getAuthToken(authCode)
            .then((rtv: AuthTokenType) => {
                console.log(rtv);
                props.updateGithubAuth(rtv.access_token);
                currentUrlParams.delete("code");
                setCurrentUrlParams(currentUrlParams);
                navigate("/tasks");
            });
        }
    },[currentUrlParams])

    return (
        <div>
            <Button onClick={() => login()}>GitHub Login</Button>
        </div>
    );
}

export default LoginPage;
