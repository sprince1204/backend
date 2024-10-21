import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        if(!user){
            throw new ApiError(404, "User not found")
        }
        const refreshToken = user.generateRefreshToken();
        const accessToken = user.generateAccessToken();

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}



    } catch (error) {
        throw new ApiError(500, "Something went Wrong while generating refresh and access token")
    }
}

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

const loginUser = asyncHandler(async (req, res)=>{
    const {email, username, password} = req.body
    if(!(email || username)){
        throw new ApiError(400, "username or email is required")
    }
    const user = await User.findOne({
        $or: [{username},{email}]
    })
    if(!user){
        throw new ApiError(404, "User not found, make new account")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "invalid user credentials");
    }

    const {accessToken, refreshToken} =  await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password, -refresh_token")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User Logged In SuccessFully"
        )
    )

    
})
//take input from frontend(email and password)
// validatae with the data from the server 
//if present(
// chck password then give access and refresh token
//send cookies)
//if not present then return invalid crdiential

const logoutUser = asyncHandler(async(req, res) =>{
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"))

})

const refreshAccessToken = asyncHandler(async(req, res) =>{
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401, "unathorised request")
    }
    try {
        const decordedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decordedToken?._id)
    
        if(!user){
            throw new ApiError(401, "Invalid refresh token")
            
        }
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"refresh Token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {
                    accessToken, refreshToken: newRefreshToken
                },
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid refresh token")
    }


})

export {registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}