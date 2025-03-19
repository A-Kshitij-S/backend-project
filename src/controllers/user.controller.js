import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/apiResponse.js"
import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken= async(userId)=>{
    try {
        const user= await User.findById(userId)
        const refreshToken= user.generateRefreshToken()
        const accessToken= user.generateAccessToken()

        user.refreshToken= refreshToken
        await user.save({validateBeforeSave: false})

        return {refreshToken, accessToken}
        
    } catch (error) {
        throw new ApiError(500, "something went wrong while genertatin refresh or access token")
    }
}

const registerUser= asyncHandler( async (req, res)=>{
    const {fullName, email, username, password}=req.body

    if(
        [fullName, email, username, password].some((e)=>
        e?.trim()==="")
    ){
        throw new ApiError(400, "All fields are required")
    }

    const checkUser= await User.findOne({
        $or: [{username}, {email}]
    })
    if(checkUser){
        throw new ApiError(409, "username or email already exist")
    }
 
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath= req.files?.coverImage[0]?.path

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && 
    req.files.coverImage.length){
        coverImageLocalPath= req.files.coverImage[0].path;  
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar= await uploadOnCloudinary(avatarLocalPath)
    const coverImage= await uploadOnCloudinary(coverImageLocalPath)
    
    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    }

    const user= await User.create({
        fullName,
        avatar:avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser= await User.findById(user._id).select(
        "-password -refreshToken"
    )
    
    if(!createdUser){
        throw new ApiError(500, "something went wrong in servers while creating user")
    }
    
    return res.status(200).json(
        new ApiResponse(200,createdUser, "user created successfully")
    )
})

const loginUser= asyncHandler(async(req, res)=>{
    const {username, password, email} = req.body

    if(!(username || email)){
        throw new ApiError(400, "username or email is required")
    }

    const user= await User.findOne({
        $or:[{username}, {email}]
    })
    
    if(!user){
        throw new ApiError(404, "user does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, " password wrong 'human' ")
    }

    const {refreshToken, accessToken}= await generateAccessAndRefreshToken(user._id)

    const loggedInUser= await User.findById(user._id).select("-password -refreshToken")

    const options={
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                    refreshToken,
                    accessToken
            },
            "user is finally logged in successfully, phew..."
        )
    )
})

const logoutUser = asyncHandler(async (req, res) => {
    // Correctly update user's refreshToken field
    await User.findOneAndUpdate(
        { _id: req.user._id }, // 🛠️ Fix: Proper filter object
        { $set: { refreshToken: null } } // Set to null instead of undefined
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Secure only in production
        sameSite: "Strict"
    };

    // Clear cookies and send response
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User Logged Out"));
});

const refreshAccessToken= asyncHandler(async (req, res)=>{
    const incommingRefreshToken= req.body.refreshToken || req.cookies.refreshToken

    if(!incommingRefreshToken) {
        throw new ApiError(401, "Unauthorized Access")
    }

    try {
        const decodedToken= jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user= await User.findById(decodedToken?._id)
    
        if(!user) {
            throw new ApiError(401, "Invalid Refresh Token")
        }
    
        if(incommingRefreshToken !== user.refreshToken){
            throw new ApiError(401, "Refresh Token is expired or used") 
        }
    
        const options={
            httpOnly:true,
            secure: true
        }
    
        const {newAccessToken, newRefreshToken}= await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("access token", newAccessToken)
        .cookie("refresh token", newRefreshToken)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken
                },
                "access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(error?.message || "Invalid Refresh Token")
    }
})

export  {
    registerUser,
    loginUser, 
    logoutUser,
    refreshAccessToken
}