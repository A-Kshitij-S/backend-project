import mongoose from "mongoose";
import express from "express";
import { DB_NAME } from "../constants.js";

const connectDB= async()=>{
    try {
        const connectionInstance= await mongoose.connect(`${process.env.DATABASE_URI}/${DB_NAME}`)
        console.log(`database connected ! DB host: ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("error in mongodb connection, ", error);
        process.exit(1)
    }
}

export default connectDB