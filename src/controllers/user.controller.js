import { asyncHandler } from "../utlis/asyncHandler.js";

const registerUser= asyncHandler( async (req, res)=>{
    res.status(200).json({
        message:"everything working fine in this api"
    })
})

export  {registerUser}