import {html, createYoffeeElement} from "../libs/yoffee/yoffee.min.js"
import {exitWall, GlobalState, onBackClicked} from "./state.js";

createYoffeeElement("footer-bar", (props, self) => {
    return html(GlobalState)`
<style>
    :host {
        display: flex;
        width: auto;
        gap: 15px;
        align-items: center;
        min-height: 40px;
        height: 40px;
        background-color: var(--background-color-3);
        padding: 0 10%;
    }
    
    @media (max-width: 900px) {
        :host {
            padding: 0 6%;
        }
    }
    
    #back-button {
        border-radius: 1000px;
        color: var(--text-color-weak);
        font-size: 14px;
        gap: 7px;
        width: fit-content;
        box-shadow: none;
        padding: 3px 7px;
        background-color: var(--background-color-3);
    }
    
    #connection-status {
        color: var(--text-color-weak);
        display: flex;
        align-items: center;
        gap: 5px;
        margin-left: auto;
    }
    
    #connection-status > #check-icon {
        color: var(--great-success-color);
        width: 25px;
    }
    
    .bt-icon {
        opacity: 0.8;
    }
</style>

<x-button id="back-button"
          onclick=${() => onBackClicked()}>
    <x-icon icon="fa fa-arrow-left"></x-icon>
    back
</x-button>
<div id="connection-status"
     data-connected=${() => GlobalState.bluetoothConnected}>
    ${renderBtIcon()}
    ${() => GlobalState.bluetoothConnected ? "connected" : "not connected"}
    ${() => GlobalState.bluetoothConnected && html()`<x-icon id="check-icon" icon="fa fa-check"></x-icon>`}
</div>
    `
})

function renderBtIcon() {
    return html()`
    <svg class="bt-icon" fill="var(--text-color)" height="18px" width="18px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
     viewBox="0 0 217.499 217.499" xml:space="preserve">
<g>
    <path d="M123.264,108.749l45.597-44.488c1.736-1.693,2.715-4.016,2.715-6.441s-0.979-4.748-2.715-6.441l-50.038-48.82
          c-2.591-2.528-6.444-3.255-9.78-1.853c-3.336,1.406-5.505,4.674-5.505,8.294v80.504l-42.331-41.3
          c-3.558-3.471-9.255-3.402-12.727,0.156c-3.471,3.558-3.401,9.256,0.157,12.727l48.851,47.663l-48.851,47.663
          c-3.558,3.471-3.628,9.169-0.157,12.727s9.17,3.628,12.727,0.156l42.331-41.3v80.504c0,3.62,2.169,6.888,5.505,8.294
          c1.128,0.476,2.315,0.706,3.493,0.706c2.305,0,4.572-0.886,6.287-2.559l50.038-48.82c1.736-1.693,2.715-4.016,2.715-6.441
          s-0.979-4.748-2.715-6.441L123.264,108.749z M121.539,30.354l28.15,27.465l-28.15,27.465V30.354z M121.539,187.143v-54.93
          l28.15,27.465L121.539,187.143z"/>
</g>
</svg>
    `
}