import {getUrlParams, registerUrlListener, updateUrlParams} from "../utilz/url-utilz.js";
import {showToast} from "../utilz/toaster.js";
import {Api} from "./api.js";
import {Bluetooth} from "./bluetooth.js";
import {SORT_TYPES} from "./routes-list/routes-filter.js";

const LOCALSTORAGE_AUTO_LEDS_KEY = "auto_ledz"
function setAutoLeds(autoLeds) {
    GlobalState.autoLeds = autoLeds
    localStorage.setItem(LOCALSTORAGE_AUTO_LEDS_KEY, autoLeds ? "true" : "false")
}

let WallImage = null
const GlobalState = {
    darkTheme: false,
    loading: false,
    bluetoothConnected: false,
    configuringHolds: false,
    autoLeds: localStorage.getItem(LOCALSTORAGE_AUTO_LEDS_KEY) === "true",  // Automatically light leds when clicking a route

    /** @type {Wall} */
    selectedWall: null,

    /** @type {Route[]} */
    routes: [],

    /** @type {Route} */
    selectedRoute: null,

    /** @type {Hold[]} */
    holds: [],

    /** @type {Map<string, Hold>} */
    holdMapping: new Map(),

    filters: [],
    sorting: SORT_TYPES.OLDEST
};
window.state = GlobalState

const LOCALSTORAGE_DARK_THEME_KEY = "darkTheme"
function updateTheme(isDark) {
    GlobalState.darkTheme = isDark;
    document.body.setAttribute("theme", GlobalState.darkTheme ? "dark" : "light")
    localStorage.setItem(LOCALSTORAGE_DARK_THEME_KEY, GlobalState.darkTheme)
}
let localStorageDarkTheme = localStorage.getItem(LOCALSTORAGE_DARK_THEME_KEY)
if (localStorageDarkTheme != null) {
    updateTheme(localStorageDarkTheme === "true", true)
} else {
    let isUserDarkTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    updateTheme(isUserDarkTheme, true)
}

async function loadRoutesAndHolds(downloadImage) {
    let response = await Api.getRoutesAndHolds(downloadImage)
    updateLikedRoutesFromLocalStorage(response.routes)
    GlobalState.routes = response.routes
    GlobalState.holds = response.holds
    if (response.image != null) {
        WallImage = response.image
    }

    GlobalState.holdMapping = new Map()
    for (let hold of GlobalState.holds) {
        GlobalState.holdMapping.set(hold.id, hold)
    }
}

/** @param route {Route} */
async function enterRoutePage(route) {
    GlobalState.selectedRoute = route
    updateUrlParams({route: route.id})
    if (GlobalState.autoLeds) {
        Bluetooth.highlightRoute(GlobalState.selectedRoute)
    }
}

async function enterConfigureHoldsPage() {
    await unselectHolds()

    GlobalState.configuringHolds = true
    updateUrlParams({configuring: true})  // Important so that clicking "back" won't exit the site
    showToast("Holds are draggable now!")

    await Bluetooth.clearLeds()
}

async function exitRoutePage() {
    if (GlobalState.configuringHolds) {
        GlobalState.configuringHolds = false
        await Bluetooth.clearLeds()
        updateUrlParams({configuring: undefined})
    } else {
        GlobalState.selectedRoute = null
        updateUrlParams({route: undefined})
        if (GlobalState.autoLeds) {
            await Bluetooth.clearLeds()
        }
    }

    await unselectHolds()
    await loadRoutesAndHolds()
}

function exitWall() {
    GlobalState.selectedWall = null
}

async function unselectHolds() {
    for (let hold of GlobalState.holds) {
        hold.inRoute = false
        hold.holdType = ""
    }
}

function snakeMeUp() {
    GlobalState.isSnaking = true
    updateUrlParams({snaking: true})  // Important so that clicking "back" won't exit the site
}


const LOCALSTORAGE_LIKED_ROUTES_KEY = "liked_routes"
let likedRouteIds = localStorage.getItem(LOCALSTORAGE_LIKED_ROUTES_KEY)
if (likedRouteIds == null) {
    likedRouteIds = new Set()
} else {
    likedRouteIds = new Set(JSON.parse(likedRouteIds))
}
async function toggleLikeRoute(route) {
    route.isLiked = !route.isLiked
    if (route.isLiked) {
        likedRouteIds.add(route.id)
    } else {
        likedRouteIds.delete(route.id)
    }
    localStorage.setItem(LOCALSTORAGE_LIKED_ROUTES_KEY, JSON.stringify([...likedRouteIds]))
    // GlobalState.routes = [...GlobalState.routes]

    // await Api.toggleLikeRoute(route.id)
}

function updateLikedRoutesFromLocalStorage(routes) {
    for (let route of routes) {
        if (likedRouteIds.has(route.id)) {
            route.isLiked = true
        }
    }
}

function onBackClicked() {
    if (GlobalState.isSnaking) {
        GlobalState.isSnaking = false
        updateUrlParams({snaking: undefined})
    } else {
        if (GlobalState.selectedRoute != null) {
            exitRoutePage()
        } else if (GlobalState.selectedWall != null) {
            exitWall()
        }
    }
}

registerUrlListener(() => onBackClicked())

export {
    GlobalState,
    WallImage,
    exitWall,
    loadRoutesAndHolds,
    enterRoutePage,
    exitRoutePage,
    updateTheme,
    unselectHolds,
    enterConfigureHoldsPage,
    snakeMeUp,
    setAutoLeds,
    toggleLikeRoute,
    likedRouteIds
}
