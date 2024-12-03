import {html, createYoffeeElement} from "../../libs/yoffee/yoffee.min.js"
import {
    GlobalState,
    enterRoutePage, exitWall, enterConfigureHoldsPage,
} from "../state.js";
import {Bluetooth} from "../bluetooth.js";
import {Api} from "../api.js";
import "./routes-list.js"
import "./routes-filter.js"
import "../components/text-input.js"
import "../components/x-loader.js"
import "../components/x-button.js"
import "../components/x-icon.js"
import "../components/x-tag.js"
import "../components/x-dialog.js"
import "../components/x-switch.js"


createYoffeeElement("routes-page", (props, self) => {
    let onScroll = scroll => {
        window.lastScrollPosition = scroll
    }

    self.onConnect = () => {
        self.shadowRoot.querySelector("routes-list").scrollTop = window.lastScrollPosition
    }

    return html(GlobalState)`
<link href="../../style/scrollbar-style.css" rel="stylesheet">
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
    
    routes-filter {
        
    }
    
    #configure-wall-button {
        background-color: var(--secondary-color);
        border-radius: 100px;
        margin-top: 10px;
    }
    
    .bottom-button {
        border-radius: 1000px;
        position: fixed;
        right: 13%;
        bottom: 50px;
        color: var(--text-color-on-secondary);
        width: 30px;
        height: 30px;
        background-color: var(--secondary-color);
    }
    
    #clear-leds-button {
        background-color: var(--background-color);
        right: calc(13% + 75px);
        font-size: 20px;
        color: var(--text-color);
    }
    
    #slash-div {
        position: absolute;
        margin-left: 1px;
        margin-bottom: 0px;
        background-color: var(--text-color);
        width: 26px;
        height: 2px;
        transform: rotate(45deg);
        border-bottom: 2px solid var(--background-color);
    }

</style>

<header-bar></header-bar>

<routes-filter></routes-filter>

${() => GlobalState.holds.length === 0 && html()`
<x-button id="configure-wall-button"
          onclick=${() => enterConfigureHoldsPage()}>
    Configure wall and add holds
</x-button>
`}

<routes-list onscroll=${e => onScroll(e.target.scrollTop)}></routes-list>

<x-button id="new-route-button"
          class="bottom-button"
          onclick=${async () => {
        let {route} = await Api.createRoute()
        route.isNew = true
        GlobalState.routes = [...GlobalState.routes, route]
        await enterRoutePage(route)
    }}>
    <x-icon icon="fa fa-plus"></x-icon>
</x-button>

<x-button id="clear-leds-button"
          class="bottom-button"
          onclick=${async () => {
        await Bluetooth.clearLeds()
    }}>
    <x-icon icon="fa fa-lightbulb"></x-icon>
    <div id="slash-div"></div>
</x-button>
`
});
