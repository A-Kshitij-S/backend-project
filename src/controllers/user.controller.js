import { asyncHandler } from "../utlis/asyncHandler.js";
import { ApiError } from "../utlis/apiError.js";
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utlis/cloudinary.js"
import {ApiResponse} from "../utlis/apiResponse.js"

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
    req.files.coverImage.length()>0){
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

export  {registerUser}