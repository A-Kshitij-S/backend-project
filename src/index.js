import { createRequire } from "module";
const require = createRequire(import.meta.url);
require('dotenv').config({ path: "./.env" }); 

import connectDB from './db/index.js';
import express from "express";


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 6969, ()=>{
        console.log("server is running in port: ", process.env.PORT);
        
    })
})
.catch((error)=>{
    console.log("error in database connection function ",error);
    
})
