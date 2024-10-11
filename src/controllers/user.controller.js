import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
const registerUser = asyncHandler( async (req, res) =>{
    //get user details from frontend
    //validation- not empty
    //check if user already exists(by username or email)
    //check for images and avatar
    //upload them to cloudniary, avavtar
    // create user object - create entry in db
    //remove password and response token field
    //check for user creation
    // return res

    

    const {username, email, fullName, password} =  req.body
    console.log("email: ", email);

    if(
        [fullName, email, username, password].some((field)=> field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }
    const existedUser =  User.findOne({
        $or:[{username}, {email}]
    })
    if(existedUser){
        throw new ApiError(409, "user with email or username is already exists")
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required")
    }

    uploadOnCloudinary


})
export {registerUser}