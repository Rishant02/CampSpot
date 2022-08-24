const Campground = require('../models/campground')
const Review = require('../models/review')
const User = require('../models/user')

module.exports.addReview = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const { rating, body } = req.body.review;
    const review = new Review({ rating: parseInt(rating), body: body });
    campground.reviews.push(review)
    review.author = req.user._id;
    await review.save()
    await campground.save()
    req.flash('success', 'Successfully added the review')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteReview = async (req, res, next) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campgrounds/${id}`)
}