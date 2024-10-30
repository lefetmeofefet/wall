import {html, createYoffeeElement} from "./libs/yoffee/yoffee.min.js"
import {GlobalState, exitRoutePage} from "./state.js";
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
        /*align-items: center;*/
        justify-content: center;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
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
    
    .route > .route-setter {
        margin-left: auto;
        margin-right: 20px;
        opacity: 0.5;
    }
    
    .route > .route-grade {
        margin-right: 10px;
    }

</style>
${() => (GlobalState.selectedRoute != null) ? html()`
<route-page route=${() => GlobalState.selectedRoute}
            onbackclicked=${async () => await exitRoutePage()}>
</route-page>
` : html()`
<routes-list></routes-list>
`
}
`
});
