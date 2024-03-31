import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export const cloudinaryUploader = async (filePath, folder) => {
  try {
    if (!filePath) return null;

    let option = {
      resource_type: "auto",
    };

    if (folder)
      option = {
        resource_type: "auto",
        folder,
      };

    const response = await cloudinary.uploader.upload(filePath, option);

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

export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;
    // PublicId from url
    // let publicId = url?.split("/").pop().split(".")[0];
    const response = await cloudinary.uploader.destroy(publicId);
    console.log(response);
  } catch (error) {
    console.error("Error in deleting file from cloudinary");
  }
};
