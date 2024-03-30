import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export const cloudinaryUploader = async (filePath) => {
  try {
    if (!filePath) return null;

    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    // console.log("File is uploaded to cloudinary ", response.url);
    
    // Deleting file from server after successful upload
    fs.unlinkSync(filePath);
    return response;
  } catch (error) {
    console.error("Error in cloudinary uploader ", error);
    fs.unlinkSync(filePath);
    return null;
  }
};
