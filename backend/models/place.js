const mongoose = require('mongoose')
const {Types} = require("mongoose")


const Schema = mongoose.Schema

const placeSchema = new Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    image: {type: String, required: true},
    address: {type: String, required: true},
    // location: {
    //     lat: {type: String, required: true},
    //     lng: {type: String, required: true}
    // },
    creator: {type: Types.ObjectId, required: true, ref: 'User'}
})

module.exports = mongoose.model('Place', placeSchema)