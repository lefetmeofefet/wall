import {html, createYoffeeElement} from "../../libs/yoffee/yoffee.min.js"
import {
    GlobalState,
    enterRoutePage,
    toggleLikeRoute
} from "../state.js";
import "../components/text-input.js"
import "../components/x-loader.js"
import "../components/x-button.js"
import "../components/x-icon.js"
import "../components/x-tag.js"
import "../components/x-dialog.js"
import "../components/x-switch.js"
import {FILTER_TYPES, SORT_TYPES} from "./routes-filter.js";


createYoffeeElement("routes-list", (props, self) => {
    return html(GlobalState)`
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
    
    @media (max-width: 900px) {
        :host {
            margin-right: -7%; /* Negative margin equal to container's padding */
            padding-right: 7%; /* Prevents content from being under the scrollbar */
        }
    }
    
    #no-routes {
        color: var(--text-color-weak-1);
        margin-top: 10px;
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
        gap: 5px;
    }
    
    .route + .route {
        border-top: 1px solid var(--text-color-weak-3);
    }
    
    .route > .left-side {
        display: flex;
        flex-direction: column;
    }
    
    .route > .left-side > .name {
        
    }
    
    .route > .left-side > .bottom-info {
        display: flex;
        gap: 3px;
        align-items: center;
        font-size: 14px;
        white-space: nowrap;
        color: var(--text-color-weak-1);
    }
    
    .route > .left-side > .bottom-info > .dot {
        background-color: var(--text-color);
        opacity: 0.6;
        border-radius: 100px;
        width: 4px;
        min-width: 4px;
        height: 4px;
        margin: 0 2px;
    }
    
    .route > .left-side > .bottom-info > .setter {
        
    }
    
    .route > .left-side > .bottom-info > .sent-icon {
        color: var(--great-success-color);
        margin-left: 2px;
    }
    
    .route > .stars {
        color: #BFA100;
        display: flex;
        font-size: 12px;
        margin-left: auto;
    }
    
    .route > .like-button {
        margin-bottom: auto;
        color: var(--text-color);
        opacity: 0.8;
        border-radius: 100px;
        padding: 7px;
        box-shadow: none;
        min-width: fit-content;
    }
    
    .route > .like-button[liked] {
        color: var(--love-color);
    }
    
    @media (hover: hover) and (pointer: fine) {
        /*This is for mobile because :hover stays on after clicking*/
        .route > .like-button:hover {
            color: var(--love-color);
        }
    }
    
    .route > .grade {
        min-width: 21px;
    }
</style>

${() => {
    let filteredRoutes = GlobalState.routes
        .filter(route => {
            for (let filter of GlobalState.filters) {
                if (filter.type === FILTER_TYPES.GRADE) {
                    if (route.grade < filter.value.min || route.grade > filter.value.max) {
                        return false
                    }
                } else if (filter.type === FILTER_TYPES.RATING) {
                    if (route.stars < filter.value) {
                        return false
                    }
                } else if (filter.type === FILTER_TYPES.SETTER) {
                    if (route.setters[0]?.id !== filter.value.id) {
                        return false
                    }
                } else if (filter.type === FILTER_TYPES.LIKED_ROUTES) {
                    if (!route.liked) {
                        return false
                    }
                } else if (filter.type === FILTER_TYPES.SENT_BY_ME) {
                    if (!route.sent) {
                        return false
                    }
                } else if (filter.type === FILTER_TYPES.NOT_SENT_BY_ME) {
                    if (route.sent) {
                        return false
                    }
                }
            }
            if (GlobalState.freeTextFilter != null) {
                if (route.name.toLowerCase().includes(GlobalState.freeTextFilter.toLowerCase())) {
                    return true
                }
                if (route.setters[0]?.nickname.toLowerCase().includes(GlobalState.freeTextFilter.toLowerCase())) {
                    return true
                }
                return false
            }
            return true
        })
        .sort((r1, r2) => {
            if (GlobalState.sorting === SORT_TYPES.NEWEST) {
                return r1.createdAt < r2.createdAt ? 1 : -1
            } else if (GlobalState.sorting === SORT_TYPES.OLDEST) {
                return r1.createdAt < r2.createdAt ? -1 : 1
            } else if (GlobalState.sorting === SORT_TYPES.RATING) {
                return r1.stars < r2.stars ? 1 : -1
            } else if (GlobalState.sorting === SORT_TYPES.MOST_SENDS) {
                return r1.sends < r2.sends ? 1 : -1
            } else if (GlobalState.sorting === SORT_TYPES.LEAST_SENDS) {
                return r1.sends < r2.sends ? -1 : 1
            }
        })
        if (filteredRoutes.length === 0) {
            if (GlobalState.holds.length === 0) {
                return null
            }
            return html()`<div id="no-routes">No routes</div>`
        }
        return filteredRoutes
            .map(route => html(route)`
<x-button class="route" 
          onclick=${() => enterRoutePage(route)}
          no-ripple>
    <div class="left-side">
        <div class="name">${() => route.name}</div>
        <div class="bottom-info">
            <div class="setter">${() => route.setters[0]?.nickname || "User deleted"},</div>
            <!--<div class="dot"></div>-->
            ${() => route.sends === 1 ? "1 send" : route.sends + " sends"}
            ${() => route.sent && html()`<x-icon class="sent-icon" icon="fa fa-check"></x-icon>`}
        </div>
    </div>
    
    <div class="stars">
        ${() => route.stars > 0 ? html()`<x-icon icon="fa fa-star"></x-icon>` : ""}
        ${() => route.stars > 1 ? html()`<x-icon icon="fa fa-star"></x-icon>` : ""}
        ${() => route.stars > 2 ? html()`<x-icon icon="fa fa-star"></x-icon>` : ""}
    </div>

    <x-button class="like-button"
              liked=${() => route.liked} 
              onclick=${() => e => {
            e.stopPropagation();
            e.preventDefault();
            toggleLikeRoute(route)
        }}>
        <x-icon icon="fa fa-heart"></x-icon>
    </x-button>
    
    <div class="grade">V${() => route.grade}</div>
</x-button>`)
}}
`
})
