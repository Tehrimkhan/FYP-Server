import express from "express";
import {
  allPostDiscountController,
  createPostController,
  deletePostController,
  getAdminPostController,
  getApprovedPostController,
  getUserPostController,
  hightoLowRentController,
  lowtoHighRentController,
  updatePostStatusController,
} from "../controllers/postController.js";
import { isAdmin, isAuth } from "../middlewares/authMiddleware.js";
import { multipleUpload } from "../middlewares/multer.js";
import { paymentController } from "../controllers/carpostController.js";

//ROUTER OBJECT
const router = express.Router();

//CREATE POST
router.post("/create-post", isAuth, multipleUpload, createPostController);

//GET ADMIN ALL POST
router.get("/get-admin-all-post", getAdminPostController);

//GET ALL APPROVED POSTS
router.get("/get-approved-posts", getApprovedPostController);

//Approve post by admin
router.put("/approve-post/:id", isAuth, isAdmin, updatePostStatusController);

//Get USER POSTS
router.get("/get-user-post", isAuth, getUserPostController);

//DELETE POSTS isAuth,
router.delete("/delete-post/:id", isAuth, deletePostController);

//ACCEPT SUBSCRIPTION
router.post("/payments", isAuth, paymentController);

//Discount
router.post("/discount", isAuth, isAdmin, allPostDiscountController);

//FILTERS
router.get("/filters/low-to-high-rent", lowtoHighRentController);
router.get("/filters/high-to-low-rent", hightoLowRentController);

//EXPORT
export default router;