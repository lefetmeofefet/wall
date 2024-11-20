import {html, createYoffeeElement} from "../../libs/yoffee/yoffee.min.js"
import {
    GlobalState,
    enterRoutePage,
    loadRoutesAndHolds,
    updateTheme,
    enterConfigureHoldsPage,
    snakeMeUp
} from "../state.js";
import {setWallBrightness, setWallName} from "../bluetooth.js";
import {enterFullscreen, exitFullscreen, isFullScreen} from "../../utilz/fullscreen.js";
import {createRoute} from "../api.js";
import "../components/text-input.js"
import "../components/x-loader.js"
import "../components/x-button.js"
import "../components/x-icon.js"
import "../components/x-tag.js"
import "../components/x-dialog.js"
import "../components/x-switch.js"


createYoffeeElement("routes-list", (props, self) => {
    return html(GlobalState)`
<link href="../../style/scrollbar-style.css" rel="stylesheet">
<style>
    :host {
        display: flex;
        flex-direction: column;
        overflow-y: scroll;
        padding-bottom: 100px;
        /*Making the scrollbar far to the right:*/
        margin-right: -10%; /* Negative margin equal to container's padding */
        padding-right: calc(10% - 7px); /* Prevents content from being under the scrollbar */
    }
    
    .route {
        display: flex;
        align-items: center;
        padding: 16px 5px;
        border-radius: 0;
        color: unset;
        box-shadow: none;
        min-height: 30px;
        height: 30px; /* Important for scroll not moving when reloading*/
        --overlay-color: rgb(var(--text-color-rgb), 0.1);
        --ripple-color: rgb(var(--text-color-rgb), 0.3);
    }
    
    .route + .route {
        border-top: 1px solid var(--text-color-weak-3);
    }
    
    .route > .left-side {
        display: flex;
        flex-direction: column;
        margin-right: 10px;
    }
    
    .route > .left-side > .name {
        
    }
    
    .route > .left-side > .setter {
        opacity: 0.5;
        white-space: nowrap;
        font-size: 14px;
    }
    
    .route > .stars {
        color: #BFA100;
        display: flex;
        margin-right: 10px;
        font-size: 12px;
        margin-left: auto;
    }
    
    .route > .grade {
        margin-right: 10px;
        width: 21px;
    }
</style>

${() => GlobalState.routes.map(route => html()`
<x-button class="route" 
          onclick=${() => enterRoutePage(route)}>
    <div class="left-side">
        <div class="name">${() => route.name}</div>
        <div class="setter">${() => route.setter}</div>
    </div>
    
    
    <div class="stars">
        ${() => route.stars > 0 ? html()`<x-icon icon="fa fa-star"></x-icon>` : ""}
        ${() => route.stars > 1 ? html()`<x-icon icon="fa fa-star"></x-icon>` : ""}
        ${() => route.stars > 2 ? html()`<x-icon icon="fa fa-star"></x-icon>` : ""}
    </div>
    
    <div class="grade">V${() => route.grade}</div>
</x-button>
`)}
`
})
