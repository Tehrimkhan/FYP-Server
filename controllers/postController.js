import postModel from "../models/postModel.js";
import cloudinary from "cloudinary";
import { getDataUri } from "../utils/feature.js";
import schedule from "node-schedule";
import { stripe } from "../server.js";
import { setTimeout } from "timers";

export const createPostController = async (req, res) => {
  try {
    const {
      postImages,
      title,
      name,
      make,
      model,
      variant,
      area,
      floor,
      room,
      rent,
      description,
    } = req.body;
    //VALIDATION
    // if (
    //   !postImages ||
    //   !title ||
    //   !make ||
    //   !model ||
    //   !variant ||
    //   !rent ||
    //   !description
    // ) {
    //   return res.status(500).send({
    //     success: false,
    //     message: "Please Provide All Fields!",
    //   });
    // }
    //added Things
    // if (!req.file) {
    //   return res.status(500).send({
    //     success: false,
    //     message: "Profile Provide Image!",
    //   });
    // }
    //  const file = getDataUri(req.file);
    //  const cdb = await cloudinary.v2.uploader.upload(file.content);
    //  const images = {
    //    public_id: cdb.public_id,
    //    url: cdb.secure_url,
    //  };
    const post = await postModel({
      //postImages: [images],
      postImages,
      title,
      name,
      make,
      model,
      variant,
      area,
      floor,
      room,
      rent,
      description,
      postedBy: req.user._id,
      status: "pending",
    }).save();
    res.status(201).send({
      sucess: true,
      message: "Post Created Sucessfully!",
      post,
    });
    console.log(req);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      sucess: false,
      message: "Error In Create Post API",
      error,
    });
  }
};
// GET ADMIN ALL POSTS
export const getAdminPostController = async (req, res) => {
  try {
    const posts = await postModel
      .find()
      .populate("postedBy", "_id name")
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      message: "All Posts Data",
      posts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In GETTING ALL POSTS API",
      error,
    });
  }
};
//GET ALL APPROVED POSTS
export const getApprovedPostController = async (req, res) => {
  try {
    const { keyword } = req.query;
    const approvedPosts = await postModel
      .find({
        status: "approved",
        name: {
          $regex: keyword ? keyword : "",
          $options: "i",
        },
      })
      .populate("postedBy", "_id name")
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      message: "All Approved Posts Data",
      totalPosts: approvedPosts.length,
      posts: approvedPosts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in fetching approved posts",
      error,
    });
  }
};
//GET TOP POSTS
export const getTopPosts = async (req, res) => {
  try {
    const posts = await postModel.find({}).sort({ rating: -1 });
    res.status(200).send({
      success: true,
      message: "Top Rated Posts",
      posts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Top Posts",
      error,
    });
  }
};

//Approve by admin
export const updatePostStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status !== "approved" && status !== "rejected") {
      return res.status(400).send({
        success: false,
        message: "Invalid status. Please provide 'approved' or 'rejected'.",
      });
    }

    const updatedPost = await postModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).send({
        success: false,
        message: "Post not found for status update",
      });
    }

    res.status(200).send({
      success: true,
      message: `Post ${
        status === "approved" ? "approved" : "rejected"
      } successfully`,
      post: updatedPost,
    });

    // delete after 1 day
    if (status === "rejected") {
      setTimeout(async () => {
        const deletedPost = await postModel.findByIdAndDelete(id);
        console.log("Post deleted after 5 minutes:", deletedPost);
      }, 24 * 60 * 60 * 1000);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in updating post status",
      error,
    });
  }
};

//GET USER POSTS
export const getUserPostController = async (req, res) => {
  try {
    const userPosts = await postModel.find({ postedBy: req.user._id });
    res.status(200).send({
      sucess: true,
      message: "USER POSTS",
      userPosts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In GET USER POSTS API",
      error,
    });
  }
};

//DELETE POST
export const deletePostController = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPost = await postModel.findByIdAndDelete(id);

    if (!deletedPost) {
      return res.status(404).send({
        success: false,
        message: "Post not found for deletion",
      });
    }

    res.status(200).send({
      success: true,
      message: "POST IS DELETED",
      deletedPost,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In DELETING POSTS API",
      error,
    });
  }
};

//PAYMENT CONTROLLER paymentController
export const paymentController = async (req, res) => {
  try {
    //get amount
    const { rent, name } = req.body;
    //VALIDATION
    if (!rent && !name) {
      res.status(404).send({
        success: false,
        message: "Name And Total Amount Is Required!",
      });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(rent * 100),
      currency: "usd",
      payment_method_types: ["card"],
      metadata: { name, rent },
    });
    const client_secret = paymentIntent.client_secret;
    res.status(200).send({
      success: true,
      message: "PAYMENT IS DONE!",
      client_secret,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error PAYMENT API",
      error,
    });
  }
};
//Working Payment Controller
//stripePaymentController
export const stripePaymentController = async (req, res) => {
  try {
    const data = req.body;
    const deductionAmount = Math.round(data.rent * 100 * 0.05);

    const lineItem = {
      price_data: {
        currency: "pkr",
        product_data: {
          name: data.name,
        },
        unit_amount: deductionAmount,
      },
      quantity: 1,
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [lineItem],
      mode: "payment",
      success_url: data.success_url || "http://localhost:19006/Dashboard",
      cancel_url: data.cancel_url || "http://localhost:19006/MyAdsPage",
    });

    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error("Error in stripePaymentController:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//DISCOUNT
export const allPostDiscountController = async (req, res) => {
  try {
    const { discountPercentage, startDate, endDate } = req.body;

    // Validate inputs
    if (
      !discountPercentage ||
      isNaN(discountPercentage) ||
      discountPercentage <= 0 ||
      discountPercentage > 100
    ) {
      return res.status(400).send({
        success: false,
        message:
          "Invalid discount percentage. Please provide a valid percentage between 1 and 100.",
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).send({
        success: false,
        message: "Discount start date and end date are required.",
      });
    }

    const startTime = new Date(startDate);
    const endTime = new Date(endDate);

    if (
      isNaN(startTime.getTime()) ||
      isNaN(endTime.getTime()) ||
      startTime >= endTime
    ) {
      return res.status(400).send({
        success: false,
        message: "Invalid start date or end date.",
      });
    }

    // Get all posts
    const allPosts = await postModel.find();
    const originalRents = [];

    for (const post of allPosts) {
      //original rent value
      originalRents.push({ postId: post._id, originalRent: post.rent });

      const discountedRent = post.rent - post.rent * (discountPercentage / 100);

      // Update the discounted rent
      await postModel.findByIdAndUpdate(post._id, { rent: discountedRent });
    }

    // reset rents to their original prices after the end time
    const job = schedule.scheduleJob(endTime, async () => {
      for (const originalRent of originalRents) {
        const { postId, originalRent: originalValue } = originalRent;
        await postModel.findByIdAndUpdate(postId, { rent: originalValue });
      }
    });

    res.status(200).send({
      success: true,
      message: `Discount of ${discountPercentage}% applied to all posts until ${endTime}.`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in applying discount.",
      error,
    });
  }
};
//REVIEWS Comment
export const postReviewController = async (req, res) => {
  try {
    const { comment, rating } = req.body;
    // find post
    const post = await postModel.findById(req.params.id);
    // check previous review
    const alreadyReviewed = post.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).send({
        success: false,
        message: "post Already Reviewed",
      });
    }
    // review object
    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };
    // passing review object to reviews array
    post.reviews.push(review);
    // number or reviews
    post.numReviews = post.reviews.length;
    post.rating =
      post.reviews.reduce((acc, item) => item.rating + acc, 0) /
      post.reviews.length;
    // save
    await post.save();
    res.status(200).send({
      success: true,
      message: "Review Added!",
    });
  } catch (error) {
    console.log(error);
    // cast error ||  OBJECT ID
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid Id",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error In Review Comment API",
      error,
    });
  }
};
//FILTERSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS
// FILTER BY LOW TO HIGH RENT
export const lowtoHighRentController = async (req, res) => {
  try {
    const posts = await postModel.find().sort({ rent: 1 });

    res.status(200).send({
      success: true,
      message: "Posts sorted by low to high rent",
      posts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Filter API",
      error,
    });
  }
};
// FILTER BY HIGH TO LOW RENT
export const hightoLowRentController = async (req, res) => {
  try {
    const posts = await postModel.find().sort({ rent: 1 });

    res.status(200).send({
      success: true,
      message: "Posts sorted by high to lowrent",
      posts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Filter API",
      error,
    });
  }
};
