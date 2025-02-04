import { createRequire } from "module";
const require = createRequire(import.meta.url);
require('dotenv').config({ path: "./.env" }); 
import { app } from "./app.js";
import connectDB from './db/index.js';

const port= process.env.PORT || 6969;

connectDB()
.then(()=>{
    app.listen(port, ()=>{
        console.log("server is running in port: ", port);
        
    })
})
.catch((error)=>{
    console.log("error in database connection function ",error);
    
})
