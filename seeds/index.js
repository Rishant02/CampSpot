const mongoose = require('mongoose');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelper');
const Campground = require('../models/campground');
mongoose.connect('mongodb://localhost:27017/yele-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once('open', () => {
    console.log('Database connected')
})
const sample = arr => arr[Math.floor(Math.random() * arr.length)]
const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const randPrice = Math.floor(Math.random() * 20) + 10
        const desc = sample(descriptors)
        const place = sample(places)
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${desc} ${place}`,
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eaque harum, a placeat at quis suscipit inventore maxime fuga quas similique assumenda eveniet tempora provident animi obcaecati id laboriosam distinctio dignissimos!',
            price: randPrice,
            author: '6304dcfd057835185aee7140',
            geometry: {
                "type": "Point",
                "coordinates": [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dw0gla16o/image/upload/v1661546796/CampSpots/vncggv7etosuflvzjkj5.jpg',
                    filename: 'CampSpots/vncggv7etosuflvzjkj5',
                },
                {
                    url: 'https://res.cloudinary.com/dw0gla16o/image/upload/v1661545366/CampSpots/jfwzjzyc4pg7rvejzu67.jpg',
                    filename: 'CampSpots/jfwzjzyc4pg7rvejzu67',
                }
            ]
        })
        await camp.save();
    }
}
seedDB().then(() => {
    mongoose.connection.close()
});