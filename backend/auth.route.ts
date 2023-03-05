import { Router } from "express";

const authRoute = Router()
authRoute.get("/getToken",(req,res)=>{
    console.log("Get Token invoked")
    // console.log(res)
    const rtv = "getToken";
    return res.send(rtv);
    //  res.status(200).json({
    //     text : "getToken"
    // })
})



export default authRoute;