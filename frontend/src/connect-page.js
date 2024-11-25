import {html, createYoffeeElement} from "../libs/yoffee/yoffee.min.js"
import {enterRoutePage, GlobalState, loadRoutesAndHolds} from "./state.js";
import "./components/text-input.js"
import "./components/x-button.js"
import "./components/x-icon.js"
import {Bluetooth} from "./bluetooth.js";
import {getUrlParams, updateUrlParams} from "../utilz/url-utilz.js";

const CONNECTED_WALLS_LOCALSTORAGE_KEY = "connected_walls"

createYoffeeElement("connect-page", () => {
    /** @type {Wall[]} */
    let pastConnectedWalls = localStorage.getItem(CONNECTED_WALLS_LOCALSTORAGE_KEY)
    if (pastConnectedWalls != null) {
        pastConnectedWalls = JSON.parse(pastConnectedWalls)
    }
    let state = {
        walls: pastConnectedWalls
    };

    let urlParams = getUrlParams()
    // TODO: Fix the navigation bugs once and for alll!!
    // if (urlParams.wall != null) {
    //     let wall = state.walls.find(wall => wall.id === urlParams.wall)
    //     if (wall != null) {
    //         chooseWall(wall)
    //     }
    // }

    async function chooseWall(wall) {
        try {
            GlobalState.loading = true
            GlobalState.selectedWall = wall
            updateUrlParams({wall: undefined})
            await loadRoutesAndHolds(true)

            if (urlParams.route != null) {
                await enterRoutePage(GlobalState.routes.find(r => r.id === urlParams.route))
            }
        } finally {
            GlobalState.loading = false
        }
    }

    async function connectToNearbyWall() {
        let wall = await Bluetooth.connectToWall()
        // Update localstorage past walls
        if (!(pastConnectedWalls || []).find(existingWall => existingWall.id === wall.id)) {
            pastConnectedWalls = [
                ...(pastConnectedWalls || []),
                wall
            ]
            localStorage.setItem(CONNECTED_WALLS_LOCALSTORAGE_KEY, JSON.stringify(pastConnectedWalls))
        }
        await chooseWall(wall)
    }

    return html(GlobalState, state)`
<link href="../style/scrollbar-style.css" rel="stylesheet">
<style>
    :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
        padding: 20px 10% 0 10%;
    }
    
    @media (max-width: 900px) {
        :host {
            padding: 20px 6% 0 6%;
        }
    }
    
    #title {
        position: relative;
        font-size: 55px;
    }
    
    #walls {
        display: flex;
        flex-direction: column;
        overflow-y: auto;
    }
    
    .wall {
        display: flex;
        flex-direction: column;
        align-items: start;
        padding: 16px 5px;
        border-radius: 0;
        color: unset;
        box-shadow: none;
        min-height: 40px;
        height: 40px; /* Important for scroll not moving when reloading*/
        --overlay-color: rgb(var(--text-color-rgb), 0.1);
        --ripple-color: rgb(var(--text-color-rgb), 0.3);
    }
    
    .wall + .wall {
        border-top: 1px solid var(--text-color-weak-3);
    }
    
    .wall > .identifier {
        color: var(--text-color-weak-1);
    }
    
    #or {
        font-size: 20px;
    }
    
    #connect-button {
        margin-top: 20px;
        border-radius: 1000px;
        color: var(--text-color-on-secondary);
        width: fit-content;
        height: 30px;
        background-color: var(--secondary-color);
        gap: 10px;
    }
</style>
<div id="title">
    WHOL
</div>
<div id="walls">
    ${() => state.walls?.map(wall => html()`
    <x-button class="wall"
              onclick=${() => chooseWall(wall)}>
        <div class="name">${() => wall.name}</div>
        <div class="identifier">${() => wall.id}</div>
    </x-button>
    `)}
</div>

<x-button id="connect-button"
          onclick=${async () => await connectToNearbyWall()}>
    Connect to nearby wall
    <x-icon icon="fa fa-sync ${() => GlobalState.loading ? "fa-spin" : ""}"></x-icon>
</x-button>
`
});
