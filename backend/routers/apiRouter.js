import {
    addHoldToRoute,
    createHold, createLedlessWall,
    createRoute, deleteHold,
    deleteRoute,
    getHolds,
    getRoutes, getUserById,
    getWallInfo, getWalls, moveHold, removeHoldFromRoute, setRouteStars, setUserNickname, setWallBrightness,
    setWallImage, setWallName, syncToWall, syncToWallByCode, updateLikedStatus,
    updateRoute, updateSentStatus, updateSetter
} from "../db.js";
import express from "express";

const router = express.Router()

router.post('/getUser', async (req, res) => {
    let user = await getUserById(req.userId)
    res.json(user)
})

router.post('/setNickname', async (req, res) => {
    const {nickname} = req.body
    await setUserNickname(req.userId, nickname)
    res.json({status: 'success'})
})

router.post('/createLedlessWall', async (req, res) => {
    const {wallName} = req.body
    let wall = await createLedlessWall(wallName, req.userId)
    res.json(wall.id)
})

router.post('/syncToWall', async (req, res) => {
    const {macAddress, wallName, brightness} = req.body
    let wall = await syncToWall(macAddress, wallName, brightness, req.userId)
    res.json(wall.id)
})

router.post('/syncToWallByCode', async (req, res) => {
    const {code} = req.body
    let wall = await syncToWallByCode(code.toUpperCase(), req.userId)
    res.json(wall.id)
})

router.post('/getWalls', async (req, res) => {
    let walls = await getWalls(req.userId)
    res.json(walls)
})

router.post('/getRoutesAndHolds', async (req, res) => {
    const {wallId, includeWallInfo} = req.body
    res.json({
        routes: await getRoutes(wallId),
        holds: await getHolds(wallId),
        wallInfo: includeWallInfo ? await getWallInfo(wallId, req.userId) : null
    })
})

router.post('/setWallImage', async (req, res) => {
    const {wallId, image} = req.body
    await setWallImage(wallId, image)
    res.json({status: 'success'})
})


router.post('/setWallName', async (req, res) => {
    const {wallId, name} = req.body
    await setWallName(wallId, name)
    res.json({status: 'success'})
})


router.post('/setWallBrightness', async (req, res) => {
    const {wallId, brightness} = req.body
    await setWallBrightness(wallId, brightness)
    res.json({status: 'success'})
})

router.post('/createRoute', async (req, res) => {
    const {wallId, setterId} = req.body
    res.json({
        route: await createRoute(wallId, setterId)
    })
})

router.post('/updateRoute', async (req, res) => {
    const {wallId, routeId, name, grade} = req.body
    await updateRoute(wallId, routeId, name, grade)
    res.json({status: 'success'})
})

router.post('/updateSetter', async (req, res) => {
    const {wallId, routeId, setterId} = req.body
    await updateSetter(wallId, routeId, setterId)
    res.json({status: 'success'})
})

router.post('/updateSentStatus', async (req, res) => {
    const {wallId, routeId, sent} = req.body
    await updateSentStatus(wallId, routeId, req.userId, sent)
    res.json({status: 'success'})
})

router.post('/updateLikedStatus', async (req, res) => {
    const {wallId, routeId, liked} = req.body
    await updateLikedStatus(wallId, routeId, req.userId, liked)
    res.json({status: 'success'})
})

router.post('/deleteRoute', async (req, res) => {
    const {wallId, routeId} = req.body
    await deleteRoute(wallId, routeId)
    res.json({status: 'success'})
})

router.post('/createHold', async (req, res) => {
    const {wallId} = req.body
    res.json({
        hold: await createHold(wallId)
    })
})

router.post('/moveHold', async (req, res) => {
    const {wallId, holdId, x, y} = req.body
    await moveHold(wallId, holdId, x, y)
    res.json({status: 'success'})
})

router.post('/deleteHold', async (req, res) => {
    const {wallId, holdId} = req.body
    await deleteHold(wallId, holdId)
    res.json({status: 'success'})
})

router.post('/addHoldToRoute', async (req, res) => {
    const {wallId, holdId, routeId, holdType} = req.body
    await addHoldToRoute(wallId, holdId, routeId, holdType)
    res.json({status: 'success'})
})

router.post('/removeHoldFromRoute', async (req, res) => {
    const {wallId, holdId, routeId} = req.body
    await removeHoldFromRoute(wallId, holdId, routeId)
    res.json({status: 'success'})
})

router.post('/setRouteStars', async (req, res) => {
    const {wallId, routeId, stars} = req.body
    await setRouteStars(wallId, routeId, stars)
    res.json({status: 'success'})
})

export {router as ApiRouter}
