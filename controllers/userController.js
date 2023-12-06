import userModel from "../models/userModel.js";
import cloudinary from "cloudinary";
import { getDataUri } from "../utils/feature.js";

//REGISTER
export const registerController = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, profileImage } = req.body;
    //VALIDATION
    if (!name || !email || !password || !confirmPassword) {
      return res.status(500).send({
        success: false,
        message: "Please Provide All Fields!",
      });
    }
    //CHECK EXISTING USER
    const exisitingUSer = await userModel.findOne({ email });
    //VALIDATION
    if (exisitingUSer) {
      return res.status(500).send({
        success: false,
        message: "Email Already Taken!",
      });
    }
    const user = await userModel.create({
      name,
      email,
      password,
      confirmPassword,
      profileImage,
    });
    res.status(201).send({
      success: true,
      message: "Registeration Success, Please Login!",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Register API",
      error,
    });
  }
};

//LOGIN CONTROLLER
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    //VALIDATION
    if (!email || !password) {
      return res.status(500).send({
        success: false,
        message: "Please Add Email OR Password!",
      });
    }
    //CHECK USER
    const user = await userModel.findOne({ email });
    //USER VALIDATION
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User Not Found",
      });
    }
    //CHECK PASSWORD
    const isMatch = await user.comparePassword(password);
    //VALIDATION PASSWORD
    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "Invalid credentials!",
      });
    }
    //JWT TOKEN
    const token = user.generateToken();

    res
      .status(200)
      .cookie("token", token, {
        expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        secure: process.env.NODE_ENV === "development" ? true : false,
        httpOnly: process.env.NODE_ENV === "development" ? true : false,
        sameSite: process.env.NODE_ENV === "development" ? true : false,
      })
      .send({
        success: true,
        message: "Login Successfully",
        token,
        user,
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: "false",
      message: "Error In Login Api",
      error,
    });
  }
};

// GET USER
export const getUserProfileController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    user.password = undefined;
    user.confirmPassword = undefined;
    res.status(200).send({
      success: true,
      message: "User Profile Fetched Successfully!",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Profile API",
      error,
    });
  }
};
//LOGOUT PROFILE
export const logoutController = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", "", {
        expires: new Date(Date.now()),
        secure: process.env.NODE_ENV === "development" ? true : false,
        httpOnly: process.env.NODE_ENV === "development" ? true : false,
        sameSite: process.env.NODE_ENV === "development" ? true : false,
      })
      .send({
        success: true,
        message: "Logout Successfully",
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Logout API",
      error,
    });
  }
};
//UPDATE USER PROFILE
export const updateProfileController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    const { name, email } = req.body;
    //VALIDATION + UPDATE
    if (name) user.name = name;
    if (email) user.email = email;
    //SAVE USER
    await user.save();
    res.status(200).send({
      success: true,
      message: "User Profile Updated!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Update Profile API",
      error,
    });
  }
};
//UPDATE USER PASSWORD
export const udpatePasswordController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    const { oldPassword, newPassword } = req.body;
    //VALIDATION
    if (!oldPassword || !newPassword) {
      return res.status(500).send({
        success: false,
        message: "Please Provide Old Or New Password!",
      });
    }
    //CHECK OLD PASSWORD
    const isMatch = await user.comparePassword(oldPassword);
    //VALIDATION
    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "Invalid Old Password!",
      });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).send({
      success: true,
      message: "Password Updated Successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Update Password API",
      error,
    });
  }
};
//UPDATE PROFILE IMAGE
export const updateProfilePicController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    // Check if the user has a profileImage before attempting to destroy it
    if (user.profileImage && user.profileImage.public_id) {
      await cloudinary.v2.uploader.destroy(user.profileImage.public_id);
    }

    // FILE GET FROM CLIENT PHOTO
    const file = getDataUri(req.file);

    // UPDATE
    const cdb = await cloudinary.v2.uploader.upload(file.content);
    user.profileImage = {
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };

    // SAVE FUNCTION
    await user.save();

    res.status(200).send({
      success: true,
      message: "Profile Picture Updated!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Update Profile Image API",
      error,
    });
  }
};

//DELETE USER
export const deleteUserController = async (req, res) => {
  try {
    const userIdToDelete = req.params.userId;

    // Check if the user exists
    const userToDelete = await userModel.findById(userIdToDelete);
    if (!userToDelete) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Perform the logic to delete the user
    await userToDelete.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error deleting user.",
      error,
    });
  }
};

//GET All USERS
export const getAllUserController = async (req, res) => {
  try {
    // Check if the requesting user is an admin
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Permission denied. Admin access required.',
    //   });
    // }

    const allUsers = await userModel.find(
      { role: { $ne: "admin" } },
      { password: 0, confirmPassword: 0 }
    );

    res.status(200).json({
      success: true,
      message: "Users fetched successfully.",
      users: allUsers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in Get Users Profile API",
      error,
    });
  }
};

// UPDATE USER ROLE
export const updateUserRoleController = async (req, res) => {
  try {
    const { userId, newRole } = req.body;
    if (!userId || !newRole) {
      return res.status(400).json({
        success: false,
        message: "Please provide userId and newRole.",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Permission denied. Admin access required.",
      });
    }
    const userToUpdate = await userModel.findById(userId);
    if (!userToUpdate) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
    userToUpdate.role = newRole;
    await userToUpdate.save();

    res.status(200).json({
      success: true,
      message: "User role updated successfully.",
      user: userToUpdate,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in Update User Role API",
      error,
    });
  }
};
