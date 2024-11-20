import {GlobalState} from "./state.js";
import {showToast} from "../utilz/toaster.js";

async function post(url, data) {
    GlobalState.loading = true
    try {
        let res = await fetch(url, {
            method: "POST",
            headers: Object.assign({
                "Content-Type": "application/json; charset=utf-8",
            }),
            body: data == null ? null : JSON.stringify(data)
        });
        return await res.json()
    } catch (e) {
        console.error(e)
        showToast(`Error communicating with server: ${e.toString()}`, {error: true})
        throw e
    } finally {
        GlobalState.loading = false
    }
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

async function addHoldToRoute(holdId, routeId, holdType) {
    return await post("/addHoldToRoute", {
        holdId,
        routeId,
        holdType: holdType || ""
    })
}

async function removeHoldFromRoute(holdId, routeId) {
    return await post("/removeHoldFromRoute", {holdId, routeId})
}

async function setRouteStars(id, stars) {
    return await post("/setRouteStars", {id, stars})
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
}
