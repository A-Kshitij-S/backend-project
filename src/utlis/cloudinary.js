import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
import dotenv from "dotenv";
dotenv.config();


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});
 
console.log("checking cloudinary variables ",process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET);

const uploadOnCloudinary= async (localFilePath)=> {
    try {
        if(!localFilePath) return null
        const response= await cloudinary.uploader.upload(localFilePath, {resource_type: "auto"})//uploads file on cloudinary

        // console.log("file uploaded successfullly on cloudinary", response.url);
        fs.unlinkSync(localFilePath)
        return response
        
    } catch (error) {
        fs.unlinkSync(localFilePath)//deletes the file which was saved locally on the server as the operation got failed
        return null
    }
}

export {uploadOnCloudinary}  