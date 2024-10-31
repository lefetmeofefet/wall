import {html, createYoffeeElement} from "./libs/yoffee/yoffee.min.js"
import {exitRoutePage, GlobalState, loadRoutesAndHolds} from "./state.js"
import "./components/text-input.js"
import "./components/x-button.js"
import "./components/x-tag.js"
import * as api from "./api.js";
import {
    addHoldToRoute,
    createHold,
    getHolds,
    moveHold,
    removeHoldFromRoute, setHoldState,
    setRouteStars,
    updateRoute
} from "./api.js";
import {showToast} from "./utilz/toaster.js";


createYoffeeElement("route-page", (props, self) => {
    let state = {
        editMode: false
    }

    const saveRoute = async () => {
        if (GlobalState.selectedRoute == null) {
            // This can happen when navigating back without focusing out of the input
            return
        }
        let selectedRoute = GlobalState.selectedRoute
        GlobalState.loading = true
        let name = self.shadowRoot.querySelector("#route-name-input").getValue()
        let grade = self.shadowRoot.querySelector("#route-grade-input").getValue()
        let setter = self.shadowRoot.querySelector("#route-setter-input").getValue()


        localStorage.setItem("setterName", setter)
        console.log(`Updating route to name: ${name}, grade: ${grade}`)
        await updateRoute(selectedRoute.id, name, grade, setter)

        selectedRoute.name = name
        selectedRoute.grade = grade
        selectedRoute.setter = setter
    }

    // set holds in route
    for (let {id, startOrFinishHold} of GlobalState.selectedRoute.holds) {
        let hold = GlobalState.holdMapping.get(id)
        hold.inRoute = true
        hold.startOrFinishHold = startOrFinishHold
    }

    // Dragging
    let clickedHold
    let dragging = false
    let dragStartPosition
    let dragContainer
    let longPressTimer
    let isAfterLongPress = false
    const MIN_DISTANCE_FOR_DRAG = 10
    const LONG_PRESS_TIME = 700

    window.addEventListener('pointerup', () => {
        clearTimeout(longPressTimer)

        if (state.editMode && clickedHold != null) {
            if (dragging) {
                moveHold(clickedHold.id, clickedHold.x, clickedHold.y)
            } else {
                holdClicked(clickedHold)
            }
        }

        clickedHold = null
        dragging = false
    })

    function bound(value) {
        return Math.max(0, Math.min(1, value));
    }

    let isDistanceEnoughForDragging = (x, y) => {
        return Math.sqrt(
            Math.pow(x - dragStartPosition.x, 2) + Math.pow(y - dragStartPosition.y, 2)
        ) >= MIN_DISTANCE_FOR_DRAG
    }

    window.addEventListener('pointermove', (event) => {
        if (clickedHold != null && state.editMode) {
            if (!dragging && isDistanceEnoughForDragging(event.pageX, event.pageY)) {
                // We wait to make the click be dismissed because of dragging=true
                dragging = true
                clearTimeout(longPressTimer)
            }
            if (dragging) {
                event.preventDefault();

                let {x, y, width, height} = dragContainer.getBoundingClientRect()
                clickedHold.x = bound((event.pageX - x) / width)
                clickedHold.y = bound((height - event.pageY + y) / height)
            }
        }
    })

    const holdClicked = async hold => {
        console.log("normal click")
        if (isAfterLongPress) {
            // When releasing after long press we don't want a normal click to be registered
            isAfterLongPress = false
            return
        }

        if (state.editMode) {
            hold.inRoute = !hold.inRoute
            hold.startOrFinishHold = false
            if (hold.inRoute) {
                await addHoldToRoute(hold.id, GlobalState.selectedRoute.id)
                GlobalState.selectedRoute.holds.push({id: hold.id})
            } else {
                await removeHoldFromRoute(hold.id, GlobalState.selectedRoute.id)
                GlobalState.selectedRoute.holds = GlobalState.selectedRoute.holds.filter(h => h.id !== hold.id)
            }
            await setHoldState(hold.id, hold.inRoute, hold.startOrFinishHold)
        }
    }

    const holdLongPressed = async hold => {
        console.log("long press")
        isAfterLongPress = true
        if (state.editMode) {
            if (!hold.inRoute) {
                await addHoldToRoute(hold.id, GlobalState.selectedRoute.id, true)
                GlobalState.selectedRoute.holds.push({id: hold.id, startOrFinishHold: true})
                hold.inRoute = true
                hold.startOrFinishHold = true
                await setHoldState(hold.id, hold.inRoute, hold.startOrFinishHold)
            }
        }
    }

    return html(GlobalState, state, GlobalState.selectedRoute)`
<style>
    :host {
        display: flex;
        flex-direction: column;
        height: -webkit-fill-available;
        overflow: hidden;
    }
    
    #header {
        position: relative;
        display: flex;
        padding: 15px 25px 10px 25px;
        background-color: var(--secondary-color);
        color: #eeeeee;
        /*align-items: center;*/
    }
    
    #header > #inputs-container {
        display: flex;
        flex-direction: column;
        width: -webkit-fill-available;
        max-width: 70%;
    }
    
    #route-name-input {   
        font-size: 20px;
        --padding: 0 20px;
    }
    
    #route-setter-input {
        height: 30px;
        font-size: 14px;
        opacity: 0.8;
        --selection-background: #0000ff15;
    }
    
    .title-text {
        font-size: 20px;
        color: var(--text-color-on-secondary);
    }
    
    .header-input {
        --background-color: transparent;
        width: -webkit-fill-available;
        /*border: 1px solid #00000010;*/
    }
    
    #header > #v-div {
        margin-left: auto;
        padding-left: 5px;
    }
    
    #header > #route-grade-input {
        --padding: 0;
        width: 40px;
        height: fit-content;
    }
    
    #header > #back-button {
        border-radius: 100px;
        height: fit-content;
        margin-right: 20px;
        font-size: 22px;
        min-width: fit-content;
        padding-left: 13px;
    }
    
    #holds-container {
        position: relative;
        margin: 13px 13px 100px 13px;
        height: inherit;
        touch-action: none;
    }
    
    #holds-container > .hold {
        position: absolute;
        width: 24px;
        height: 24px;
        background-color: #00000050;
        border-radius: 100px;
        color: var(--text-color-on-secondary);
        transform: translate(-50%, 50%);
    }
    
    #plus-button, #edit-button, #star-button {
        border-radius: 1000px;
        position: fixed;
        right: 10%;
        bottom: 30px;
        color: var(--text-color-on-secondary);
        width: 30px;
        height: 30px;
        background-color: var(--secondary-color);
    }
    
    #edit-button {
        right: calc(10% + 75px);
        background-color: var(--text-color-weak-1);
    }
    
    #edit-button[active] {
        background-color: var(--secondary-color);
    }
    
    #star-button {
        left: calc(10% + 75px);
        background-color: var(--text-color-weak-1);
    }
    
    #star-button[active] {
        background-color: #BFA100;
    }
    
    #delete-button {
        border-radius: 1000px;
        position: fixed;
        left: 10%;
        bottom: 30px;
        color: var(--text-color-on-secondary);
        width: 30px;
        height: 30px;
        background-color: #fa3344;
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
        background-color: var(--text-color-weak-2);
        animation: loading 2s infinite;
        margin-bottom: -2px;
    }
    
    @keyframes loading {
        0% { width: 0; margin-left: 0; }
        50% { width: 100%; margin-left: 0; }
        100% { width: 0; margin-left: 100%; }
    }
</style>
` : ""}

<div id="header">
    <x-button id="back-button"
              onclick=${() => exitRoutePage()}>
        <x-icon icon="fa fa-caret-left"></x-icon>     
    </x-button>
    
    <div id="inputs-container">
        <text-input id="route-name-input"
                    class="title-text header-input"
                    value=${GlobalState.selectedRoute.name}
                    changed=${() => () => saveRoute()}
                    submitted=${() => () => console.log("Submitted.")}
                    onpointerdown=${e => isMobile && !e.target.selected && e.target.select()}
                    onpointerup=${e => !isMobile && !e.target.selected && e.target.select()}
        ></text-input>
        <text-input id="route-setter-input"
                    class="title-text header-input"
                    value=${GlobalState.selectedRoute.setter}
                    changed=${() => () => saveRoute()}
                    submitted=${() => () => console.log("Submitted.")}
                    onpointerdown=${e => isMobile && !e.target.selected && e.target.select()}
                    onpointerup=${e => !isMobile && !e.target.selected && e.target.select()}
        ></text-input>
    </div>
    
    <div id="v-div" class="title-text"
         onpointerdown=${() => self.shadowRoot.querySelector("#route-grade-input").select()}>V</div>
    <text-input id="route-grade-input"
                type="number"
                class="title-text header-input"
                value=${GlobalState.selectedRoute.grade}
                submitted=${() => () => console.log("Submitted.")}
                changed=${() => () => saveRoute()}
                onpointerdown=${e => isMobile && !e.target.selected && e.target.select()}
                onpointerup=${e => !isMobile && !e.target.selected && e.target.select()}
    ></text-input>
</div>
<div id="holds-container">
    ${() => GlobalState.holds.map(hold => html(hold)`
    <div class="hold"
         style="${() => `
            left: ${hold.x * 100}%; 
            bottom: ${hold.y * 100}%; 
            ${hold.inRoute && `background-color: ${hold.startOrFinishHold ? "#20ff30" : "var(--secondary-color)"};`}`}"
         onpointerdown=${e => {
             dragContainer = self.shadowRoot.querySelector("#holds-container")
             clickedHold = hold
             dragStartPosition = {x: e.pageX, y: e.pageY}
             e.stopPropagation()
             e.preventDefault()
             longPressTimer = setTimeout(() => holdLongPressed(hold), LONG_PRESS_TIME)
         }}
         
         >
    </div>
    `)}
</div>
<x-button id="plus-button"
          onclick=${async () => {
              let {hold} = await createHold()
              GlobalState.holdMapping.set(hold.id, hold)
              GlobalState.holds = [...GlobalState.holds, hold]
          }}>
    <x-icon icon="fa fa-plus"></x-icon>
</x-button>
<x-button id="edit-button"
          active=${() => state.editMode}
          onclick=${async () => {
              state.editMode = !state.editMode
              if (state.editMode) {
                  showToast("Holds are draggable now!")
              }
          }}>
    <x-icon icon="fa fa-edit"></x-icon>
</x-button>
<x-button id="delete-button"
          onclick=${async () => {
              if (confirm(`U gonna destroy ${GlobalState.selectedRoute.name}. Proceed??`)) {
                  await api.deleteRoute(GlobalState.selectedRoute.id)
                  await loadRoutesAndHolds()
                  await exitRoutePage()
              }
          }}>
    <x-icon icon="fa fa-trash"></x-icon>
</x-button>
<x-button id="star-button"
          active=${() => GlobalState.selectedRoute?.stars > 0}
          onclick=${async () => {
        let stars = (GlobalState.selectedRoute.stars || 0) + 1
        if (stars > 3) {
            stars = 0
        }
        GlobalState.selectedRoute.stars = stars
        await setRouteStars(GlobalState.selectedRoute.id, stars)
    }}>
    <x-icon icon="fa fa-star"></x-icon>
    ${() => GlobalState.selectedRoute?.stars > 1 ? html()`<x-icon icon="fa fa-star"></x-icon>` : ""}
    ${() => GlobalState.selectedRoute?.stars > 2 ? html()`<x-icon icon="fa fa-star"></x-icon>` : ""}
</x-button>
`
})
