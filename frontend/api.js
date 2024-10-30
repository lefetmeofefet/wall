import {GlobalState} from "./state.js";

async function post(url, data) {
    GlobalState.loading = true
    let res = await fetch(url, {
        method: "POST",
        headers: Object.assign({
            "Content-Type": "application/json; charset=utf-8",
        }),
        body: data == null ? null : JSON.stringify(data)
    });
    let json = await res.json()
    GlobalState.loading = false
    return json
}

async function getRoutesAndHolds() {
    return await post("/getRoutesAndHolds")
}

async function getRoutes() {
    return await post("/getRoutes")
}

async function createRoute() {
    return await post("/createRoute", {setter: localStorage.getItem("setterName") || "WHO AM I?"})
}

async function updateRoute(id, name, grade, setter) {
    return await post("/updateRoute", {id, name, grade, setter})
}

async function deleteRoute(id) {
    return await post("/deleteRoute", {id})
}

async function getHolds() {
    return await post("/getHolds")
}

async function createHold() {
    return await post("/createHold")
}

async function moveHold(id, x, y) {
    return await post("/moveHold", {id, x, y})
}

async function deleteHold(id) {
    return await post("/deleteHold", {id})
}

async function addHoldToRoute(holdId, routeId, startOrFinishHold) {
    return await post("/addHoldToRoute", {
        holdId,
        routeId,
        startOrFinishHold: startOrFinishHold || false
    })
}

async function removeHoldFromRoute(holdId, routeId) {
    return await post("/removeHoldFromRoute", {holdId, routeId})
}

async function setRouteStars(id, stars) {
    return await post("/setRouteStars", {id, stars})
}

// Arduino functions
async function enterRoute(id) {
    return await post("/enterRoute", {id})
}

async function exitRoute() {
    return await post("/exitRoute", {})
}

async function setHoldState(holdId, isOn, startOrFinishHold) {
    return await post("/setHoldState", {holdId, isOn, startOrFinishHold})
}

export {
    getRoutesAndHolds,
    getRoutes,
    createRoute,
    updateRoute,
    deleteRoute,
    getHolds,
    createHold,
    moveHold,
    deleteHold,
    addHoldToRoute,
    removeHoldFromRoute,
    setRouteStars,
    enterRoute,
    exitRoute,
    setHoldState
}
