import mongoose, {Schema} from "mongoose";

const subscriptionSchema= new Schema({
    subscriber:{
        type: Schema.Types.ObjectId, //one which is subscribing
        ref: "User"
    },
    channel:{
        type: Schema.Types.ObjectId, //one to whome "subscriber" is subscribing
        ref: "User"
    }
})

export const Subscription= mongoose.model("Subscription", subscriptionSchema)