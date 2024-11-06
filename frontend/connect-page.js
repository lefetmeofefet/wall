import {html, createYoffeeElement} from "./libs/yoffee/yoffee.min.js"
import {enterRoutePage, GlobalState} from "./state.js";
import "./routes-list.js"
import "./route-page.js"
import "./components/text-input.js"
import "./components/x-button.js"
import "./components/x-icon.js"
import "./components/x-tag.js"
import {getWallName, scanAndConnect} from "./bluetooth.js";
import {getUrlParams} from "./utilz/url-utilz.js";
import {showToast} from "./utilz/toaster.js";

createYoffeeElement("connect-page", () => {
    let state = {

    };

    return html(GlobalState, state)`
<link href="./style/scrollbar-style.css" rel="stylesheet">
<style>
    :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
        padding: 20px 10% 0 10%;
    }
    
    #title {
        position: relative;
        font-size: 55px;
    }
    
    .wall {
        display: flex;
        align-items: center;
        padding: 16px 5px;
        border-radius: 0;
        color: unset;
        box-shadow: none;
        min-height: 22px;
    }
    
    .wall + .wall {
        border-top: 1px solid #00000020;
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
    WALL
</div>
<x-button id="connect-button"
          onclick=${async () => {
              GlobalState.loading = true
              try {
                  GlobalState.wallName = await scanAndConnect()
                  
                  // If we have route in url, enter it
                  let urlParams = getUrlParams()
                  if (urlParams.route != null) {
                      await enterRoutePage(GlobalState.routes.find(r => r.id === urlParams.route))
                  }
              } catch(e) {
                  console.log("Error connecting to BT: ", e)
                  if (e.code !== 8) {  // If user pressed "Cancel"
                      showToast(`Error connecting to Bluetooth: ${e.toString()}`)
                  }
              } finally {
                  GlobalState.loading = false
              }
          }}>
    Connect to Wall
    <x-icon icon="fa fa-sync ${() => GlobalState.loading ? "fa-spin" : ""}"></x-icon>
</x-button>
`
});
