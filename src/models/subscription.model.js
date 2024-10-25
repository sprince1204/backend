import mongoose, {Schema} from "mongoose"

const subscriptionSchema = new Schema({
    subscriber:{
        type: Schema.type.ObjectId, //user who is a subscriber
        ref: "User"
    },
    channel: {
        type: Schema.type.ObjectId, //user 'subscriber' who is subscribing
        ref: "User"
    }
}, {timestamps: true})

export const Subscription  = mongoose.model("Subscription", subscriptionSchema)