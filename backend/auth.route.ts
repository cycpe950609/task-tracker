import { Router } from "express";
import qs from "qs";
import axios from "axios";

const authRoute = Router()
authRoute.post("/getToken",async (req,res)=>{
    // console.log(req.body.data);
    const code = req.body.data.code;
    if(code === undefined)
        return res.status(400).send("");
    // console.log("Get Code",code);
    // console.log("Get Token invoked");
    // console.log(req.body);
    // console.log(res)
    // console.log("client_id" , process.env.GITHUB_CLIENT_ID)
    // console.log("client_secret", process.env.GITHUB_CLIENT_SECRET)
    // console.log("code" , code)
    const authUrl = "https://github.com/login/oauth/access_token";
    const queryOption = { 
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
    };
    const qstring = qs.stringify(queryOption);
    const tokenUrl = `${authUrl}?${qstring}`
    // console.log(tokenUrl);
    const {data} = await axios.post(tokenUrl);
    const rtv = qs.parse(data);

    // console.log(rtv);
    // return res.send("getToken")
    return res.send(rtv)
})



export default authRoute;