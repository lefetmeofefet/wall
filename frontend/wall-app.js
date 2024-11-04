import {html, createYoffeeElement} from "./libs/yoffee/yoffee.min.js"
import {GlobalState, exitRoutePage} from "./state.js";
import "./connect-page.js"
import "./routes-list.js"
import "./route-page.js"
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
${() => GlobalState.wallName == null ? html()`
<connect-page></connect-page>
` : ((GlobalState.selectedRoute != null) ? html()`
<route-page route=${() => GlobalState.selectedRoute}
            onbackclicked=${async () => await exitRoutePage()}>
</route-page>
` : html()`
<routes-list></routes-list>
`)}
`
});
