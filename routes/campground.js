const express = require('express')
const router = express.Router()
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware/middleware')
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground')
const ExpressError = require('../utils/expressError');
const objectID = require('mongoose').Types.ObjectId


router.get('/', catchAsync(async (req, res, next) => {
    const camp = await Campground.find({});
    res.render('campgrounds/index', { camp });
}))
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
})
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Succesfully created a campground')
    res.redirect(`campgrounds/${campground._id}`);
}))
router.get('/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    if (!objectID.isValid(id)) {
        return next(new ExpressError('Invalid ID'))
    }
    const camp = await Campground.findById(id).populate({ path: 'reviews', populate: { path: 'author' } }).populate('author');
    if (!camp) {
        req.flash('error', 'Cannot find the requested campground')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { camp })
}))
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!objectID.isValid(id)) {
        return next(new ExpressError('Invalid ID'))
    }
    if (!campground) {
        req.flash('error', 'Cannot find the requested campground')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground });
}))
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Successfully updated the campground')
    res.redirect(`/campgrounds/${camp._id}`);
}))
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted the campground')
    res.redirect('/campgrounds')
}))

module.exports = router;