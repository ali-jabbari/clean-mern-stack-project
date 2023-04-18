const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const placesRouter = require('./routes/places-routes')
const usersRouter = require('./routes/users-routes')
const HttpError = require("./models/http-error")
const fs = require("fs")
const path = require("path")

const app = express()

app.use(bodyParser.json())
app.use('/uploads/images', express.static(path.join('uploads','images')))


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
    next()
})

app.use('/api/places', placesRouter) // => /api/places/...
app.use('/api/users', usersRouter)

app.use((req, res, next) => {
    throw new HttpError('Could not find this route.', 404)
})

app.use((error, req, res, next) => {

    //delete file upload if error occurred
    if (req.file) {
        fs.unlink(req.file.path, (err)=>{
            console.log(err)
        })
    }

    if (res.headerSent) {
        return next(error)
    }
    res.status(error.code || 500)
    res.json({message: error.message || 'An unknown error occurred!'})
})

mongoose.connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jypdodw.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`)
    .then(() => {
        app.listen(5000)
    })
    .catch(err => {
        console.log(err)
    })
