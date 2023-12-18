import express from "express";
import multer from "multer";
import {
  UploadImageController,
  deleteUserController,
  getAllUserController,
  getUserProfileController,
  loginController,
  logoutController,
  registerController,
  udpatePasswordController,
  updateProfileController,
  updateProfilePicController,
  updateUserRoleController,
} from "../controllers/userController.js";
import { isAdmin, isAuth } from "../middlewares/authMiddleware.js";
import { singleUpload } from "../middlewares/multer.js";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//ROUTER object
const router = express.Router();

//ROUTES
//REGISTER
router.post("/register", registerController);

//LOGIN
router.post("/login", loginController);

//PROFILE
router.get("/profile", isAuth, getUserProfileController);

//LOGOUT
router.get("/logout", isAuth, logoutController);

//UPDATE - Profile
router.put("/profile-update", isAuth, updateProfileController);

//UPDATE - ProfilePassword
router.put("/update-password", isAuth, udpatePasswordController);

//UPDATE - ProfileImage//isAuth,
// router.put("/update-image", isAuth, singleUpload, updateProfilePicController);
// router.post("/upload-image", upload.single("photo"), uploadUserImage);
router.post("/upload-profile-image", isAuth, UploadImageController);

//DELETE USER ADMIN ONLY
router.delete("/delete-user/:userId", isAuth, isAdmin, deleteUserController);

//GET ALL USER isAuth, , isAdmin
router.get("/get-all-users", getAllUserController);

//UPDATE User role
router.put("/updateUserRole", isAuth, isAdmin, updateUserRoleController);

//export
export default router;
