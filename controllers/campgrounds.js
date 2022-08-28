const Campground = require('../models/campground')
const objectID = require('mongoose').Types.ObjectId;
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })
const ExpressError = require('../utils/expressError')
const { cloudinary } = require('../cloudinary')

module.exports.index = async (req, res, next) => {
    const camps=await Campground.find({});
    const campgrounds = await Campground.paginate(
        {},
        {
            page: req.query.page || 1,
            limit: 10,
            sort: "-_id"
        }
    );
    campgrounds.page = Number(campgrounds.page)
    let totalPages = campgrounds.totalPages;
    let currentPage = campgrounds.page;
    let startPage;
    let endPage;
    if (totalPages <= 10) {
        startPage = 1;
        endPage = totalPages;
    } else {
        if (currentPage <= 6) {
            startPage = 1;
            endPage = 10;
        } else if (currentPage + 4 >= totalPages) {
            startPage = totalPages - 9;
            endPage = totalPages
        } else {
            startPage = currentPage - 5;
            endPage = currentPage + 4;
        }
    }
    // const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {
        campgrounds,
        camps,
        startPage,
        endPage,
        currentPage,
        totalPages
    });
};

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createNewCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.geometry = geoData.body.features[0].geometry;
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Succesfully created a campground')
    res.redirect(`campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req, res, next) => {
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
}

module.exports.renderEditForm = async (req, res, next) => {
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
}

module.exports.updateCampground = async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    camp.images.push(...imgs);
    await camp.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await camp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash('success', 'Successfully updated the campground')
    res.redirect(`/campgrounds/${camp._id}`);
}

module.exports.deleteCampground = async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted the campground')
    res.redirect('/campgrounds')
}