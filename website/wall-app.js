import {html, createYoffeeElement} from "./libs/yoffee/yoffee.min.js"
import {State} from "./state.js";
import "./route-page.js"
import "./components/text-input.js"
import "./components/x-button.js"
import "./components/x-icon.js"
import "./components/x-tag.js"
import {unhighlightAllHolds} from "./api.js";

createYoffeeElement("wall-app", () => {
    let isInRouteUrl = false
    window.addEventListener("popstate", e => {
        console.log("State popped!")
        exitRoutePage()
    })

    let exitRoutePage = async () => {
        state.selectedRoute = null;
        for (let hold of State.holds) {
            hold.inRoute = false
            hold.yoffeeObj.inRoute = false
        }
        await unhighlightAllHolds();
    }

    let state = {
        selectedRoute: null,
    };

    return html(state, State)`
    <style>
        :host {
            display: flex;
            /*align-items: center;*/
            justify-content: center;
            flex-direction: column;
            height: 100%;
            overflow: hidden;
        }
        
        #routes-container {
            display: flex;
            flex-direction: column;
            padding: 40px 10%;
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
        
        .route > .route-setter {
            margin-left: auto;
            margin-right: 20px;
            opacity: 0.5;
        }
        
        .route > .route-grade {
            margin-right: 10px;
        }
        
        #new-route-button {
            border-radius: 1000px;
            position: fixed;
            right: 10%;
            bottom: 30px;
            color: var(--text-color-on-secondary);
            width: 30px;
            height: 30px;
            background-color: var(--secondary-color);
        }

    </style>
    ${() => (state.selectedRoute != null) ?
        html()`
    <route-page route=${() => state.selectedRoute}
                onbackclicked=${async () => {
                    await exitRoutePage()
                    if (isInRouteUrl) {
                        window.history.back();
                    }
        }}
    ></route-page>
    `
        :
        html()`
    <div id="filters-container">
        
    </div>
    <div id="routes-container">
        ${() => State.routes.map(route => html()`
        <x-button class="route" onclick=${() => {
            let currentLocation = window.location.pathname;
            window.history.pushState({}, "", `${currentLocation}/route/${route.name}`)
            isInRouteUrl = true
            state.selectedRoute = route
        }}>
            <div class="route-name">${() => route.name}</div>
            <div class="route-setter">${() => route.setter}</div>
            <div class="route-grade">V${() => route.grade}</div>
        </x-button>
        `)}
    </div>
    
    <x-button id="new-route-button" onclick=${() => () => state.selectedRoute = {
            name: "Route Name",
            grade: 0,
            holds: [],
            setter: "me",
            identifier: Date.now().toString(36) + Math.random().toString(36).substring(2)
        }}>
        <x-icon icon="fa fa-plus"></x-icon>
    </x-button>
    `
    }
    `
});
