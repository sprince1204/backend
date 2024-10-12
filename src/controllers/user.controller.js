import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
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
    // console.log("email: ", email);

    if(
        [fullName, email, username, password].some((field)=> field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }
    const existedUser = await User.findOne({
        $or:[{username}, {email}]
    })
    if(existedUser){
        throw new ApiError(409, "user with email or username is already exists")
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;                         for this line if we not upload cover image then it give error meassage of undefined path so next is for substitute for this
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required")
    }

    const avatar =  await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullName, 
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const CreatedUser = await User.findById(user._id).select("-password -refreshToken")

    if(!CreatedUser){
        throw new ApiError(500, "something went Wrong while creating user")
    }


    return res.status(201).json(
        new ApiResponse(200, CreatedUser, "user registered Successfully")
    )

})
export {registerUser}