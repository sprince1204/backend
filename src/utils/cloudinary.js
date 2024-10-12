import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFileStorage)=>{
    try {
        if(!localFileStorage) return null;
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFileStorage, {
            resource_type: "auto"
        })
        //file is uploaded sucessfully
        // console.log("file is uploaded on cloudinary", response.url);
        fs.unlinkSync(localFileStorage)

        return response;
    } catch (error) {
        fs.unlinkSync(localFileStorage) //remove locally stored file
        return null;
    }
}


export {uploadOnCloudinary}