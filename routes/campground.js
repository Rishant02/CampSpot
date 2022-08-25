if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require('express')
const router = express.Router()
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware/middleware')
const catchAsync = require('../utils/catchAsync')
const campgrounds = require('../controllers/campgrounds') //CAMPGROUND CONTROLLER
const { storage } = require('../cloudinary')
const multer = require('multer')
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createNewCampground))

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))



router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

module.exports = router;