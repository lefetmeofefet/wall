import {html, createYoffeeElement} from "../../libs/yoffee/yoffee.min.js"
import {
    GlobalState,
    enterRoutePage,
    loadRoutesAndHolds,
    updateTheme,
    enterConfigureHoldsPage,
    snakeMeUp, setAutoLeds, exitWall
} from "../state.js";
import {clearLeds, setWallBrightness, setWallName} from "../bluetooth.js";
import {enterFullscreen, exitFullscreen, isFullScreen} from "../../utilz/fullscreen.js";
import {createRoute} from "../api.js";
import "./routes-list.js"
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
    
    #header {
        position: relative;
        display: flex;
        gap: 15px;
        align-items: center;
    }
    
    #header > #title {
        font-size: 55px;
    }
    
    #header > #refresh-button {
        border-radius: 1000px;
        color: var(--text-color-weak-1);
        width: 15px;
        min-width: 15px;
        height: 30px;
        background-color: var(--text-color-weak-3);
    }
    
    #header > #search-button {
        border-radius: 1000px;
        color: var(--text-color-weak-1);
        width: 15px;
        min-width: 15px;
        height: 30px;
        background-color: var(--text-color-weak-3);
    }
    
    x-switch {
        --circle-color: var(--secondary-color);
    }
    
    #header > #settings-button {
        transition: 300ms;
        color: var(--text-color);
        cursor: pointer;
        padding: 19px 10px;
        margin: 0px 5px;
        font-size: 18px;
        border-bottom: 3px solid #00000000;
        display: flex;
        gap: 8px;
        -webkit-tap-highlight-color: transparent; /* Stops the blue background highlight */
    }
    
    #header > #settings-button:hover {
        transition: 300ms;
        color: var(--secondary-color);
    }
    
    #settings-dialog {
        padding: 20px 5px;
        color: var(--text-color);
        background-color: var(--background-color); 
        width: max-content;
    }
    
    #settings-container {
        display: flex;
        flex-direction: column;
        align-items: baseline;
    }
    
    #settings-container > .settings-item {
        padding: 10px 20px;
        justify-content: flex-start;
        display: flex;
        align-items: center;
    }
    
    #settings-container > .settings-item > x-icon {
        width: 20px;
        margin-right: 10px;
    }
    
    #settings-container > x-button {
        --overlay-color: rgb(var(--text-color-rgb), 0.1);
        --ripple-color: rgb(var(--text-color-rgb), 0.3);
        box-shadow: none;
        color: var(--text-color);
        width: -webkit-fill-available;
    }
    
    #new-route-button, #clear-leds-button {
        border-radius: 1000px;
        position: fixed;
        right: 13%;
        bottom: 40px;
        color: var(--text-color-on-secondary);
        width: 30px;
        height: 30px;
        background-color: var(--secondary-color);
    }
    
    #clear-leds-button {
        background-color: var(--text-color-weak-3);
        right: calc(13% + 75px);
        font-size: 20px;
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

${() => GlobalState.loading ? html()`
<style>
    /* Loader */
    #header::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        height: 2px;
        width: 0;
        background-color: var(--secondary-color);
        animation: loading 2s infinite;
    }
    
    @keyframes loading {
        0% { width: 0; margin-left: 0; }
        50% { width: 100%; margin-left: 0; }
        100% { width: 0; margin-left: 100%; }
    }
</style>
` : ""}

<div id="header">
    <div id="title"
         onclick=${async () => {
        let newWallName = prompt("What would you like to call your wall?")
        if (newWallName != null) {
            GlobalState.loading = true
            await setWallName(newWallName)
            GlobalState.selectedWall.name = newWallName
            GlobalState.loading = false
        }
    }}>
        ${() => GlobalState.selectedWall?.name}
    </div>
    <x-button id="refresh-button"
              onclick=${async () => {
        await loadRoutesAndHolds()
    }}>
        <x-icon icon="fa fa-sync ${() => GlobalState.loading ? "fa-spin" : ""}"></x-icon>
    </x-button>
    <x-button id="search-button"
              onclick=${async () => {
        console.log("Searching")
    }}>
        <x-icon icon="fa fa-search"></x-icon>
    </x-button>
    <div id="settings-button" 
         style="margin-left: auto;"
         tabindex="0"
         onkeydown=${() => e => e.stopPropagation()}
         onmousedown=${() => () => {
        let _dropdown = self.shadowRoot.querySelector("#settings-dialog")
        let _button = self.shadowRoot.querySelector("#settings-button")
        if (_dropdown.isOpen()) {
            _dropdown.close()
        } else {
            _dropdown.open({
                x: _button.offsetLeft,
                y: _button.offsetTop + _button.offsetHeight + 5
            }, true)
        }
    }}
         onblur=${() => requestAnimationFrame(() => self.shadowRoot.querySelector("#settings-dialog").close())}>
        <x-icon icon="fa fa-bars"></x-icon>
    <!--    <x-icon icon="fa fa-ellipsis-v"></x-icon>-->
    </div>
    
    <x-dialog id="settings-dialog">
        <div id="settings-container">
            <x-button class="settings-item"
                      onclick=${() => enterConfigureHoldsPage()}>
                <x-icon icon="fa fa-hand-rock"></x-icon>
                Configure Holds
            </x-button>
            <x-button class="settings-item"
                      onclick=${() => console.log("bling bling")}>
                <x-icon icon="fa fa-file-image"></x-icon>
                Change wall image
            </x-button>
            <x-button class="settings-item"
                      onclick=${async () => {
                          let brightness = parseInt(prompt("Enter brightness from 0 to 100: "))
                          if (!isNaN(brightness)) {
                              let realBrightness = Math.round((brightness / 100) * 255)
                              await setWallBrightness(realBrightness)
                              GlobalState.selectedWall.brightness = realBrightness
                          }
                      }}>
                <x-icon icon="fa fa-lightbulb"></x-icon>
                Brightness:
                <div style="margin-left: auto">
                    ${() => Math.round((GlobalState.selectedWall?.brightness / 255) * 100)}%
                </div>
            </x-button>
            <div id="theme-toggle"
                 class="settings-item">
                <x-icon icon=${() => GlobalState.darkTheme ? "fa fa-moon" : "fa fa-sun"}></x-icon>
                <div>Theme:</div>
                <x-switch value=${() => GlobalState.darkTheme}
                          style="--circle-size: 20px; margin-left: auto; padding-left: 10px;"
                          switched=${() => () => updateTheme(!GlobalState.darkTheme)}>
                     ${() => GlobalState.darkTheme ? "dark" : "light"}
                </x-switch>
            </div>
            <x-button class="settings-item"
                      id="fullscreen"
                      onclick=${() => {
                          isFullScreen() ? exitFullscreen() : enterFullscreen();
                          self.shadowRoot.querySelector("#settings-dialog").close()
                      }}>
                <x-icon icon="fa fa-expand"></x-icon>
                Toggle fullscreen
            </x-button>
            <x-button class="settings-item"
                      id="auto-leds">
                <x-icon icon="fa fa-bolt"></x-icon>
                <div>Auto leds</div>
                <x-switch value=${() => GlobalState.autoLeds}
                          style="--circle-size: 20px; margin-left: auto; padding-left: 10px;"
                          switched=${() => () => setAutoLeds(!GlobalState.autoLeds)}>
                </x-switch>
            </x-button>
            <x-button class="settings-item"
                      id="snakeio"
                      onclick=${() => snakeMeUp()}>
                <x-icon icon="fa fa-question"></x-icon>
                Snake me up
            </x-button>
            <x-button class="settings-item"
                      id="exit-wall"
                      onclick=${() => exitWall()}>
                <x-icon icon="fa fa-caret-left"></x-icon>
                Exit wall
            </x-button>
        </div>
    </x-dialog>
</div>

<div id="filters-container">
</div>

<routes-list onscroll=${e => onScroll(e.target.scrollTop)}></routes-list>

<x-button id="new-route-button" 
          onclick=${async () => {
        let {route} = await createRoute()
        route.isNew = true
        GlobalState.routes = [...GlobalState.routes, route]
        await enterRoutePage(route)
    }}>
    <x-icon icon="fa fa-plus"></x-icon>
</x-button>

<x-button id="clear-leds-button" 
          onclick=${async () => {
        await clearLeds()
    }}>
    <x-icon icon="fa fa-lightbulb"></x-icon>
    <div id="slash-div"></div>
</x-button>
`
});
