import {html, createYoffeeElement} from "./libs/yoffee/yoffee.min.js"
import {GlobalState, enterRoutePage, loadRoutesAndHolds} from "./state.js";
import {createRoute} from "./api.js";
import "./route-page.js"
import "./components/text-input.js"
import "./components/x-loader.js"
import "./components/x-button.js"
import "./components/x-icon.js"
import "./components/x-tag.js"
import "./components/x-dialog.js"
import "./components/x-switch.js"
import {setWallName} from "./bluetooth.js";

createYoffeeElement("routes-list", (props, self) => {
    return html(GlobalState)`
<link href="./style/scrollbar-style.css" rel="stylesheet">
<style>
    :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
    }
    
    #title {
        position: relative;
        font-size: 55px;
        padding: 20px 10% 0 10%;
    }
    
    #routes-container {
        display: flex;
        flex-direction: column;
        padding: 0 10%;
        overflow-y: auto;
    }
    
    .route {
        display: flex;
        align-items: center;
        padding: 16px 5px;
        border-radius: 0;
        color: unset;
        box-shadow: none;
        min-height: 22px;
    }
    
    .route + .route {
        border-top: 1px solid #00000020;
    }
    
    .route > .stars {
        color: #BFA100;
        display: flex;
        margin-left: 8px;
        font-size: 12px;
    }
    
    .route > .setter {
        margin-left: auto;
        margin-right: 20px;
        opacity: 0.5;
    }
    
    .route > .grade {
        margin-right: 10px;
    }
    
    #refresh-button {
        border-radius: 1000px;
        position: fixed;
        right: calc(13% + 70px);
        top: 40px;
        color: var(--text-color-on-secondary);
        width: 15px;
        height: 30px;
        background-color: var(--text-color-weak-1);
    }
    
    #new-route-button {
        border-radius: 1000px;
        position: fixed;
        right: 13%;
        top: 40px;
        color: var(--text-color-on-secondary);
        width: 30px;
        height: 30px;
        background-color: var(--secondary-color);
    }

</style>

${() => GlobalState.loading ? html()`
<style>
    /* Loader */
    #title::after {
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

<div id="title"
     onclick=${async () => {
         let newWallName = prompt("What would you like to call your wall?")
         if (newWallName != null) {
             GlobalState.loading = true
             await setWallName(newWallName)
             GlobalState.wallName = newWallName
             GlobalState.loading = false
         }
     }}>
    ${() => GlobalState.wallName}
</div>
<div id="filters-container">
</div>
<div id="routes-container">
    ${() => GlobalState.routes.map(route => html()`
    <x-button class="route" 
              onclick=${() => enterRoutePage(route)}>
        <div class="name">${() => route.name}</div>
        ${() => route.stars > 0 ? html()`
        <div class="stars">
            <x-icon icon="fa fa-star"></x-icon>
            ${() => route.stars > 1 ? html()`<x-icon icon="fa fa-star"></x-icon>` : ""}
            ${() => route.stars > 2 ? html()`<x-icon icon="fa fa-star"></x-icon>` : ""}
        </div>
        ` : ""}
        <div class="setter">${() => route.setter}</div>
        <div class="grade">V${() => route.grade}</div>
    </x-button>
    `)}
</div>

<x-button id="refresh-button"
          onclick=${async () => {
              await loadRoutesAndHolds()
          }}>
    <x-icon icon="fa fa-sync ${() => GlobalState.loading ? "fa-spin" : ""}"></x-icon>
</x-button>
<x-button id="new-route-button" 
          onclick=${async () => {
              let {route} = await createRoute()
              GlobalState.routes = [...GlobalState.routes, route]
              await enterRoutePage(route)
          }}>
    <x-icon icon="fa fa-plus"></x-icon>
</x-button>

<div id="settings-button" 
     style="display: none;"
     class="header-button"
     tabindex="0"
     onkeydown=${() => e => e.stopPropagation()}
     onmousedown=${() => () => {
        let _dropdown = self.shadowRoot.querySelector("#settings-dialog")
        let _button = self.shadowRoot.querySelector("#settings-button")
        if (_dropdown.isOpen()) {
            _dropdown.close()
        }
        else {
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
        <div id="theme-toggle">
            <div>Theme</div>
            <x-switch value=${() => GlobalState.darkTheme}
                      style="--circle-size: 20px;"
                      switched=${() => () => updateTheme(!GlobalState.darkTheme)}>
                 ${() => GlobalState.darkTheme ? "dark" : "light"}
            </x-switch>
        </div>
        <div id="snakeio">
            Snake me up
        </div>
    </div>
</x-dialog>
`
});
