const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isreviewAuthor,validateReview} = require("../middleware.js");


//POST 
//REVIEW ROUTE
router.route("/")
.post(isLoggedIn,validateReview,wrapAsync( async(req,res)=>{
 let listing = await Listing.findById(req.params.id);
 let newReview = new Review(req.body.review);
newReview.author = req.user._id;
 listing.reviews.push(newReview);

 await newReview.save();
 await listing.save();
 req.flash("success","New Review Created!");
res.redirect(`/listings/${listing._id}`);
}));

// Delete review route
router.delete(
  "/:reviewId",isLoggedIn,
  isreviewAuthor,
  wrapAsync(async(req,res) => { 
  let {id , reviewId} = req.params;

  await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
  await Review.findByIdAndDelete(reviewId);
  req.flash("success","Review Deleted!");
   res.redirect(`/listings/${id}`);
}));

module.exports = router;