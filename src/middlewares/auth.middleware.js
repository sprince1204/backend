import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import jwt from "jsonwebtoken"



export const verifyJWT = asyncHandler(async(req, _, next) =>{
    try {
        
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token){
            throw new ApiError(401, "Unathorised request: token missing") 
        }
    
        const decordedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        if(!decordedToken){
            throw new ApiError(401, "Invalid Access decordedToken") 
        }
    
        const user = await User.findById(decordedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401, "invalid Access Token")
        }
        
        req.user = user;
        next()
    } catch (error) {
        
        throw new ApiError(401, error?.message || "invalid Access Token")
        
    }


})