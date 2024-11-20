import http from 'http'
import express from 'express'
import https from 'https'
import fs from 'fs'
import {Config} from "./config.js"
import {
    addHoldToRoute,
    createHold,
    createRoute,
    deleteHold,
    deleteRoute,
    getHolds, getRoute,
    getRoutes,
    moveHold, removeHoldFromRoute, setRouteStars,
    updateRoute
} from "./db.js";
// import {clearLEDs, sendDataToArduino, setLEDs} from "./arduino.js";

const app = express()

app.use(express.static('frontend'))
app.use(express.json())

app.post('/getRoutesAndHolds', async (req, res) => {
    res.json({
        routes: await getRoutes(),
        holds: await getHolds()
    })
})

app.post('/getRoutes', async (req, res) => {
    res.json({
        routes: await getRoutes()
    })
})

app.post('/createRoute', async (req, res) => {
    const {setter} = req.body
    res.json({
        route: await createRoute(setter)
    })
})

app.post('/updateRoute', async (req, res) => {
    const {id, name, grade, setter} = req.body
    await updateRoute(id, name, grade, setter)
    res.json({status: 'success'})
})

app.post('/deleteRoute', async (req, res) => {
    const {id} = req.body
    await deleteRoute(id)
    res.json({status: 'success'})
})

app.post('/getHolds', async (req, res) => {
    res.json({
        holds: await getHolds()
    })
})

app.post('/createHold', async (req, res) => {
    res.json({
        hold: await createHold()
    })
})

app.post('/moveHold', async (req, res) => {
    const {id, x, y} = req.body
    await moveHold(id, x, y)
    res.json({status: 'success'})
})

app.post('/deleteHold', async (req, res) => {
    const {id} = req.body
    await deleteHold(id)
    res.json({status: 'success'})
})

app.post('/addHoldToRoute', async (req, res) => {
    const {holdId, routeId, holdType} = req.body
    await addHoldToRoute(holdId, routeId, holdType)
    res.json({status: 'success'})
})

app.post('/removeHoldFromRoute', async (req, res) => {
    const {holdId, routeId} = req.body
    await removeHoldFromRoute(holdId, routeId)
    res.json({status: 'success'})
})

app.post('/setRouteStars', async (req, res) => {
    const {id, stars} = req.body
    await setRouteStars(id, stars)
    res.json({status: 'success'})
})

app.listen(Config.port, () => {
    console.log(`WHOL is UP! https://localhost:${Config.port}`)
})
