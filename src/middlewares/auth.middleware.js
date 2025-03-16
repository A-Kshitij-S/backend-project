import { ApiError } from "../utlis/apiError";
import { asyncHandler } from "../utlis/asyncHandler";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";

const verifyJWT = asyncHandler(async(req, res, next)=>{
    try {
        const token= req.cookie?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token){
            throw new ApiError(401, " Unauthorized Access")
        }
    
        const decodedToken= jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user= await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401, "Invalid Access Token")
        }
        req.user= user;
        next()      
    } catch (error) {
        throw new ApiError( 401, error?.message || "invalid Access Token")
    }
})

export {verifyJWT}