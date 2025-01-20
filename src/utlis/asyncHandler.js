const asyncHandler= (func)=> async (req, res, next)=>{
    try {
        await func(req, res, next);
    } catch (error) {
        console.log("error in async handler: ", error);
        
    }
}

export {asyncHandler}

// above code or the below code for handeling the async handler


// const asyncHandler = (requestHandler) => {
//     return (req, res, next) => {
//         Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
//     }
// }
