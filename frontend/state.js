import {enterRoute, exitRoute, getRoutesAndHolds} from "./api.js";
import {getUrlParams, registerUrlListener, updateUrlParams} from "./utilz/url-utilz.js";

const GlobalState = {
    loading: true,

    /** @type {Route} */
    selectedRoute: null,

    /** @type {Hold[]} */
    holds: [],

    /** @type {Map<string, Hold>} */
    holdMapping: new Map(),

    /** @type {Route[]} */
    routes: []
};
window.state = GlobalState

async function loadRoutesAndHolds() {
    let {routes, holds} = await getRoutesAndHolds()
    GlobalState.routes = routes
    GlobalState.holds = holds
    GlobalState.holdMapping = new Map()
    for (let hold of GlobalState.holds) {
        GlobalState.holdMapping.set(hold.id, hold)
    }
}
loadRoutesAndHolds()
    .then(() => {
        let urlParams = getUrlParams()
        if (urlParams.route != null) {
            enterRoutePage(GlobalState.routes.find(r => r.id === urlParams.route))
        }
    })

/** @param route {Route} */
async function enterRoutePage(route) {
    GlobalState.selectedRoute = route
    updateUrlParams({route: route.id})
    await enterRoute(route.id)
}

async function exitRoutePage() {
    GlobalState.selectedRoute = null
    updateUrlParams({route: undefined})
    for (let hold of GlobalState.holds) {
        hold.inRoute = false
        hold.startOrFinishHold = false
    }
    await exitRoute()
    await loadRoutesAndHolds()
}
registerUrlListener(() => exitRoutePage())

export {GlobalState, loadRoutesAndHolds, enterRoutePage, exitRoutePage}
