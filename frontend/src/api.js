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

async function getRoutesAndHolds(includeImage) {
    return await post("/getRoutesAndHolds", {
        wallId: GlobalState.selectedWall.id,
        includeImage: includeImage || false
    })
}

async function setWallImage(image) {
    return await post("/setWallImage", {
        wallId: GlobalState.selectedWall.id,
        image
    })
}

async function createRoute() {
    return await post("/createRoute", {
        wallId: GlobalState.selectedWall.id,
        setter: localStorage.getItem("setterName") || "WHO AM I?"
    })
}

async function updateRoute(routeId, name, grade, setter) {
    return await post("/updateRoute", {wallId: GlobalState.selectedWall.id, routeId, name, grade, setter})
}

async function deleteRoute(routeId) {
    return await post("/deleteRoute", {wallId: GlobalState.selectedWall.id, routeId})
}

async function createHold(wallId) {
    return await post("/createHold", {wallId: GlobalState.selectedWall.id})
}

async function moveHold(holdId, x, y) {
    return await post("/moveHold", {wallId: GlobalState.selectedWall.id, holdId, x, y})
}

async function deleteHold(holdId) {
    return await post("/deleteHold", {wallId: GlobalState.selectedWall.id, holdId})
}

async function addHoldToRoute(holdId, routeId, holdType) {
    return await post("/addHoldToRoute", {
        wallId: GlobalState.selectedWall.id,
        holdId,
        routeId,
        holdType: holdType || ""
    })
}

async function removeHoldFromRoute(holdId, routeId) {
    return await post("/removeHoldFromRoute", {wallId: GlobalState.selectedWall.id, holdId, routeId})
}

async function setRouteStars(routeId, stars) {
    return await post("/setRouteStars", {wallId: GlobalState.selectedWall.id, routeId, stars})
}

export {
    getRoutesAndHolds,
    setWallImage,
    createRoute,
    updateRoute,
    deleteRoute,
    createHold,
    moveHold,
    deleteHold,
    addHoldToRoute,
    removeHoldFromRoute,
    setRouteStars,
}
