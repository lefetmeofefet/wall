import express from 'express'
import {Config} from "./config.js"
import {
    addHoldToRoute,
    createHold,
    createRoute,
    deleteHold,
    deleteRoute,
    getHolds, getRoute,
    getRoutes, getWallImage,
    moveHold, removeHoldFromRoute, setRouteStars, setWallImage,
    updateRoute
} from "./db.js";
import "express-async-errors"

const app = express()

app.use(express.static('frontend'))
app.use(express.json({limit: "100mb"}))

app.post('/getRoutesAndHolds', async (req, res) => {
    const {wallId, includeImage} = req.body
    res.json({
        routes: await getRoutes(wallId),
        holds: await getHolds(wallId),
        image: includeImage ? await getWallImage(wallId) : null
    })
})

app.post('/setWallImage', async (req, res) => {
    const {wallId, image} = req.body
    await setWallImage(wallId, image)
    res.json({status: 'success'})
})

app.post('/createRoute', async (req, res) => {
    const {wallId, setter} = req.body
    res.json({
        route: await createRoute(wallId, setter)
    })
})

app.post('/updateRoute', async (req, res) => {
    const {wallId, routeId, name, grade, setter} = req.body
    await updateRoute(wallId, routeId, name, grade, setter)
    res.json({status: 'success'})
})

app.post('/deleteRoute', async (req, res) => {
    const {wallId, routeId} = req.body
    await deleteRoute(wallId, routeId)
    res.json({status: 'success'})
})

app.post('/createHold', async (req, res) => {
    const {wallId} = req.body
    res.json({
        hold: await createHold(wallId)
    })
})

app.post('/moveHold', async (req, res) => {
    const {wallId, holdId, x, y} = req.body
    await moveHold(wallId, holdId, x, y)
    res.json({status: 'success'})
})

app.post('/deleteHold', async (req, res) => {
    const {wallId, holdId} = req.body
    await deleteHold(wallId, holdId)
    res.json({status: 'success'})
})

app.post('/addHoldToRoute', async (req, res) => {
    const {wallId, holdId, routeId, holdType} = req.body
    await addHoldToRoute(wallId, holdId, routeId, holdType)
    res.json({status: 'success'})
})

app.post('/removeHoldFromRoute', async (req, res) => {
    const {wallId, holdId, routeId} = req.body
    await removeHoldFromRoute(wallId, holdId, routeId)
    res.json({status: 'success'})
})

app.post('/setRouteStars', async (req, res) => {
    const {wallId, routeId, stars} = req.body
    await setRouteStars(wallId, routeId, stars)
    res.json({status: 'success'})
})

// Global error middleware
app.use((err, req, res, next) => {
    if (err) {
        console.error(err.stack)
        res.status(err.statusCode || 500).json(err.message)
    }
})

app.listen(Config.port, () => {
    console.log(`WHOL is UP! https://localhost:${Config.port}`)
})

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err)
})

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason)
})
