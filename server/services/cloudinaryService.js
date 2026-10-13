// /server/services/cloudinaryService.js

import cloudinary from "../config/cloudinary.js";

// Upload single image
export const uploadImage = async (file, folder = "products") => {
  try {
    if (!file || !file.buffer) {
      throw new Error("Invalid image file");
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          quality: "auto",
          fetch_format: "auto",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(file.buffer);
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    throw new Error(`Image upload failed: ${error.message}`);
  }
};

// Upload multiple images
export const uploadMultipleImages = async (
  files,
  folder = "products"
) => {
  try {
    if (!files || !Array.isArray(files) || files.length === 0) {
      return [];
    }

    const uploadPromises = files.map((file) =>
      uploadImage(file, folder)
    );

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Multiple image upload error:", error);

    throw new Error(
      `Multiple image upload failed: ${error.message}`
    );
  }
};

// Delete image
export const deleteImage = async (publicId) => {
  try {
    if (!publicId) {
      return { success: true };
    }

    const result = await cloudinary.uploader.destroy(publicId);

    return {
      success: result.result === "ok",
    };
  } catch (error) {
    console.error("Cloudinary delete error:", error);

    throw new Error(
      `Image deletion failed: ${error.message}`
    );
  }
};