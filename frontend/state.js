import {getRoutesAndHolds} from "./api.js";
import {getUrlParams, registerUrlListener, updateUrlParams} from "./utilz/url-utilz.js";
import {clearLeds, highlightRoute} from "./bluetooth.js";
import {showToast} from "./utilz/toaster.js";

const GlobalState = {
    loading: true,
    darkTheme: false,
    wallName: null,
    wallBrightness: 120,
    configuringHolds: false,

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
    highlightRoute(GlobalState.selectedRoute)
}

async function enterConfigureHoldsPage() {
    GlobalState.configuringHolds = true
    updateUrlParams({configuring: true})  // Important so that clicking "back" won't exit the site
    showToast("Holds are draggable now!")
    await unselectHolds()
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
    await loadRoutesAndHolds()
}

async function unselectHolds() {
    for (let hold of GlobalState.holds) {
        hold.inRoute = false
        hold.startOrFinishHold = false
    }
    await clearLeds()
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
        exitRoutePage()
    }
}

registerUrlListener(() => onBackClicked())


export {
    GlobalState,
    loadRoutesAndHolds,
    enterRoutePage,
    exitRoutePage,
    updateTheme,
    unselectHolds,
    enterConfigureHoldsPage,
    snakeMeUp
}
