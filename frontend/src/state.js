import {getRoutesAndHolds} from "./api.js";
import {getUrlParams, registerUrlListener, updateUrlParams} from "../utilz/url-utilz.js";
import {clearLeds, getWallInfo, highlightRoute} from "./bluetooth.js";
import {showToast} from "../utilz/toaster.js";

const LOCALSTORAGE_AUTO_LEDS_KEY = "auto_ledz"
function setAutoLeds(autoLeds) {
    GlobalState.autoLeds = autoLeds
    localStorage.setItem(LOCALSTORAGE_AUTO_LEDS_KEY, autoLeds ? "true" : "false")
}

const GlobalState = {
    darkTheme: false,
    loading: true,
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

/** @param route {Route} */
async function enterRoutePage(route) {
    GlobalState.selectedRoute = route
    updateUrlParams({route: route.id})
    if (GlobalState.autoLeds) {
        highlightRoute(GlobalState.selectedRoute)
    }
}

async function enterConfigureHoldsPage() {
    GlobalState.configuringHolds = true
    updateUrlParams({configuring: true})  // Important so that clicking "back" won't exit the site
    showToast("Holds are draggable now!")
    await unselectHolds()
    await clearLeds()
}

async function exitRoutePage() {
    if (GlobalState.configuringHolds) {
        GlobalState.configuringHolds = false
        updateUrlParams({configuring: undefined})
    } else {
        GlobalState.selectedRoute = null
        updateUrlParams({route: undefined})
    }

    await unselectHolds()
    if (GlobalState.autoLeds) {
        await clearLeds()
    }
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
    exitWall,
    loadRoutesAndHolds,
    enterRoutePage,
    exitRoutePage,
    updateTheme,
    unselectHolds,
    enterConfigureHoldsPage,
    snakeMeUp,
    setAutoLeds
}
