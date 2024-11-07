import {html, createYoffeeElement} from "./libs/yoffee/yoffee.min.js"
import {GlobalState, exitRoutePage, unselectHolds} from "./state.js";
import "./connect-page.js"
import "./snake-page.js"
import "./route-page.js"
import "./routes-list.js"
import "./components/text-input.js"
import "./components/x-button.js"
import "./components/x-icon.js"
import "./components/x-tag.js"

createYoffeeElement("wall-app", () => {
    let state = {

    };

    return html(GlobalState, state)`
<style>
    :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
    }

</style>
${() => {
    if (GlobalState.wallName == null) {
        return html()`<connect-page></connect-page>`
    } else if (GlobalState.selectedRoute != null) {
        return html()`<route-page route=${() => GlobalState.selectedRoute}></route-page>`
    } else if (GlobalState.configuringHolds) {
        return html()`<route-page></route-page>`
    } else if (GlobalState.isSnaking) {
        return html()`<snake-page></snake-page>`
    } else {
        return html()`<routes-list></routes-list>`
    }
}}
`
});