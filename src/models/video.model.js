 import mongoose, {Schema} from "mongoose";
 import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
 const videoSchema = new Schema(
    {
        videlFile: {
            type: String,   //cloudnary url
            required: true,
        },
        thumbnail: {
            type: String,   //cloudnary url
            required: true,
        },
        title: {
            type: String,   //cloudnary url
            required: true,
        },
        description: {
            type: String,   
            required: true,
        },
        duration: {
            type: Number,
            required: true
        },
        views:{
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }

    },
    {
        timestamps: true
    }
 )
 
 videoSchema.pligin(mongooseAggregatePaginate)


 export const video = mongoose.model("video", videoSchema)