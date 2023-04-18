const {validationResult} = require('express-validator')
const HttpError = require("../models/http-error")
const Place = require("../models/place")
const User = require("../models/user")
const {startSession} = require("mongoose")
const fs = require("fs")
const e = require("express")


const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid

    let place
    try {
        place = await Place.findById(placeId)
    } catch (err) {
        const error = new HttpError('Something went wrong, could not find a place.', 500)
        return next(error)
    }

    if (!place) {
        const error = new HttpError('Could not find a place for the provided id.', 404)
        return next(error)
    }

    res.json({place: place.toObject({getters: true})})
}

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid

    let places
    try {
        places = await Place.find({creator: userId})
    } catch (err) {
        const error = new HttpError('Fetching places failed, please try again later.', 500)
        return next(error)
    }

    if (!places || places.length === 0) {
        throw next(new HttpError('Could not find a places for the provided user id.', 404))
    }

    res.json({places: places.map(place => place.toObject({getters: true}))})
}

const createPlace = async (req, res, next) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data.', 422))
    }

    const {title, description, address } = req.body

    const createdPlace = new Place({
        title,
        description,
        image: req.file.path,
        address,
        creator: req.userData.userId
    })

    let user
    try {
        user = await User.findById(req.userData.userId)
    } catch (err) {
        return next(new HttpError('Creating place failed.', 422))
    }

    if (!user) {
        return next(new HttpError('Could not find user for provided id.', 422))
    }

    try {
        const sess = await startSession()
        sess.startTransaction()
        await createdPlace.save({session: sess})
        user.places.push(createdPlace)
        await user.save({session: sess})
        await sess.commitTransaction()
    } catch (err) {
        const error = new HttpError('Creating place failed, please try again', 500)
        return next(error)
    }


    res.status(201).json({
        message: 'Successfully Added!', place: createdPlace
    })
}

const updatePlace = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data.', 422))
    }

    const {title, description} = req.body
    const placeId = req.params.pid

    let place
    try {
        place = await Place.findById(placeId)
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update a place.', 500)
        return next(error)
    }

    if (place.creator.toString() !== req.userData.userId){
        const error = new HttpError('you are not allowed edit this place.', 401)
        return next(error)
    }

    place.title = title
    place.description = description

    try {
        await place.save()
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update a place.', 500)
        return next(error)
    }

    res.status(200).json({place: place.toObject({getters: true})})
}


const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid

    let place
    try {
        place = await Place.findById(placeId).populate('creator')
    } catch (err) {
        const error = new HttpError('Something went wrong, could not delete a place.', 500)
        return next(error)
    }

    if (!place){
        const error = new HttpError('Could not find place for this id.', 404)
        return next(error)
    }

    if (place.creator.id !== req.userData.userId){
        const error = new HttpError('you are not allowed delete this place.', 401)
        return next(error)
    }

    const imagePath = place.image

    try {
        const sess = await startSession()
        sess.startTransaction()
        await place.remove({session: sess})
        place.creator.places.pull(place)
        await place.creator.save({session: sess})
        await sess.commitTransaction()

    } catch (err) {
        const error = new HttpError('Something went wrong, could not delete a place.', 500)
        return next(error)
    }

    fs.unlink(imagePath, (err) => {
        console.log(err)
    })

    res.status(200).json({message: 'Deleted place.'})
}


exports.getPlaceById = getPlaceById
exports.getPlacesByUserId = getPlacesByUserId
exports.createPlace = createPlace
exports.updatePlace = updatePlace
exports.deletePlace = deletePlace

