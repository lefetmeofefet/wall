import {html, createYoffeeElement} from "../../libs/yoffee/yoffee.min.js"
import {exitRoutePage, GlobalState, toggleLikeRoute, toggleSentRoute, WallImage} from "../state.js"
import {Api} from "../api.js"
import {showToast} from "../../utilz/toaster.js";
import {Bluetooth} from "../bluetooth.js";
import "../components/text-input.js"
import "../components/x-button.js"
import "../components/x-tag.js"

createYoffeeElement("single-route-page", (props, self) => {
    let state = {
        editMode: GlobalState.selectedRoute?.isNew ? true : GlobalState.configuringHolds,
        highlightingRoute: GlobalState.autoLeds
    }
    if (GlobalState.selectedRoute?.isNew) {
        GlobalState.selectedRoute.isNew = undefined
    }

    const setterId = () => {
        if (GlobalState.selectedRoute != null) {
            return GlobalState.selectedRoute.setters[0]?.id
        }
    }
    const setterName = () => {
        if (GlobalState.selectedRoute != null) {
            let setter = GlobalState.selectedRoute.setters[0]
            if (setter == null) {
                return
            }
            return setter.id === GlobalState.user.id ? "Me" : setter.nickname
        }
    }

    const saveRoute = async () => {
        if (GlobalState.selectedRoute == null) {
            // This can happen when navigating back without focusing out of the input
            return
        }
        let selectedRoute = GlobalState.selectedRoute
        let name = self.shadowRoot.querySelector("#route-name-input").getValue()

        await Api.updateRoute(selectedRoute.id, {name})
        selectedRoute.name = name
    }

    // set holds in route
    if (GlobalState.selectedRoute != null) {
        for (let {id, holdType} of GlobalState.selectedRoute.holds) {
            let hold = GlobalState.holdMapping.get(id)
            hold.inRoute = true
            hold.holdType = holdType
        }
    }

    // Dragging
    let clickedHold
    let dragging = false
    let dragStartPosition
    let dragContainer
    let longPressTimer
    let isAfterLongPress = false
    const MIN_DISTANCE_FOR_DRAG = 10
    const LONG_PRESS_TIME = 500

    window.addEventListener('pointerup', async () => {
        clearTimeout(longPressTimer)

        if (state.editMode && clickedHold != null) {
            if (dragging) {
                if (GlobalState.configuringHolds) {
                    Api.moveHold(clickedHold.id, clickedHold.x, clickedHold.y)
                }
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
        if (clickedHold != null) {
            if (!dragging && isDistanceEnoughForDragging(event.pageX, event.pageY)) {
                // We wait to make the click be dismissed because of dragging=true
                dragging = true
                clearTimeout(longPressTimer)
            }
            if (dragging) {
                event.preventDefault();

                if (GlobalState.configuringHolds) {
                    let {x, y, width, height} = dragContainer.getBoundingClientRect()
                    clickedHold.x = bound((event.pageX - x) / width)
                    clickedHold.y = bound((height - event.pageY + y) / height)
                }
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

        if (GlobalState.configuringHolds) {
            // Clear the current led
            for (let hold of GlobalState.holds) {
                if (hold.inRoute) {
                    hold.inRoute = false
                    hold.holdType = ""
                    await Bluetooth.setHoldState(hold)
                }
            }

            // Light the clicked led
            hold.inRoute = !hold.inRoute
            hold.holdType = ""
            await Bluetooth.setHoldState(hold)
            return
        }

        if (!state.editMode) {
            showToast("Click the edit button to edit the route")
        }

        if (state.editMode && GlobalState.selectedRoute != null) {
            hold.inRoute = !hold.inRoute
            hold.holdType = ""
            if (GlobalState.autoLeds || state.highlightingRoute) {
                await Bluetooth.setHoldState(hold)
            }
            if (hold.inRoute) {
                await Api.addHoldToRoute(hold.id, GlobalState.selectedRoute.id)
                GlobalState.selectedRoute.holds.push({id: hold.id, ledId: hold.ledId})
            } else {
                await Api.removeHoldFromRoute(hold.id, GlobalState.selectedRoute.id)
                GlobalState.selectedRoute.holds = GlobalState.selectedRoute.holds.filter(h => h.id !== hold.id)
            }
        }
    }

    const holdLongPressed = async hold => {
        console.log("long press")
        isAfterLongPress = true

        if (GlobalState.configuringHolds) {
            return
        }

        if (state.editMode && GlobalState.selectedRoute != null) {
            hold.inRoute = true
            // Cycle between start and finish holds on long press
            if (hold.holdType === "start") {
                hold.holdType = "finish"
            } else {
                hold.holdType = "start"
            }

            if (GlobalState.autoLeds || state.highlightingRoute) {
                await Bluetooth.setHoldState(hold)
            }

            // If its in route, we remove it to add it again with a different holdType
            if (hold.inRoute) {
                await Api.removeHoldFromRoute(hold.id, GlobalState.selectedRoute.id)
            }
            await Api.addHoldToRoute(hold.id, GlobalState.selectedRoute.id, hold.holdType)
            GlobalState.selectedRoute.holds.push({id: hold.id, ledId: hold.ledId, holdType: hold.holdType})
        }
    }

    return html(GlobalState, state, GlobalState.selectedRoute || {})`
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
        flex-direction: column;
    }
    
    #header > #top-row {
        display: flex;
        align-items: center;
    }
    
    #header > #top-row > #route-name-input {   
        font-size: 20px;
        padding: 0;
        max-width: 85%;
    }
    
    #header > #top-row > #settings-button {
        margin-left: auto;
        transition: 300ms;
        color: var(--text-color);
        cursor: pointer;
        padding: 10px 5px;
        font-size: 18px;
        border-bottom: 3px solid #00000000;
        display: flex;
        -webkit-tap-highlight-color: transparent;
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
    
    #header > #bottom-row {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    #header > #bottom-row > #setter-container {
        display: flex;
        align-items: center;
        gap: 4px;
        height: 30px;
        font-size: 14px;
        opacity: 0.8;
    }
    
    #setter-button {
        gap: 6px;
        padding: 1px 6px;
        box-shadow: none;
    }
    
    #header > #bottom-row > #grade-container {
        display: flex;
        align-items: center;
        gap: 4px;
        height: 30px;
        font-size: 14px;
        opacity: 0.8;
        margin-left: auto;
    }
    
    #grade-button {
        gap: 6px;
        padding: 1px 6px;
        box-shadow: none;
        font-size: 16px;
    }
    
    x-dialog {
        background-color: var(--background-color);
        color: var(--text-color);
    }
    
    #grade-dialog {
        max-height: 395px;
        overflow-y: auto;
    }
    
    .header-dialog > .item {
        padding: 10px 20px;
        cursor: pointer;
    }
    
    #grade-dialog > .item {
        padding: 8px 20px;
    }
    
    .header-dialog > .item:hover {
        background-color: var(--hover-color);
    }
    
    .header-dialog > .item[data-selected] {
        color: var(--secondary-color);
    }
    
    .title-text {
        font-size: 20px;
        color: var(--text-color-on-secondary);
    }
    
    .header-input {
        background-color: transparent;
        width: -webkit-fill-available;
        /*border: 1px solid #00000010;*/
    }
    
    #route {
        display: flex;
        height: inherit;
        position: relative;
        /*margin-bottom: 70px;*/
        /*background-image: url("../res/wall.jpg"); DEFINED BELOW */
        background-size: 100% 100%; /* Stretches the image to fit the div exactly */
        background-position: center; /* Centers the image in the div */
        background-repeat: no-repeat; /* Prevents tiling */
        background-color: #ffffffe0;
        max-width: 75vh;
        align-self: center;
        width: -webkit-fill-available;
    }
    
    #holds-container {
        position: relative;
        margin: 13px 13px 13px 13px;
        height: inherit;
        touch-action: none;
        width: -webkit-fill-available;
    }
    
    #holds-container > .hold {
        position: absolute;
        width: 24px;
        height: 24px;
        background-color: #00000040;
        border-radius: 100px;
        color: var(--text-color-on-secondary);
        transform: translate(-50%, 50%);
        /*opacity: 0.6;*/
        border: 3px solid transparent;
    }
    
    #holds-container > .hold:is([data-hold-type=hold], [data-hold-type=start], [data-hold-type=finish]) {
        width: 34px;
        height: 34px;
        background-color: transparent;
    }
    
    #holds-container > .hold[data-hold-type=hold] {
        border-color: var(--secondary-color);
    }
    
    #holds-container > .hold[data-hold-type=start] {
        border-color: #20ff30;
    }
    
    #holds-container > .hold[data-hold-type=finish] {
        border-color: #fa3344;
    }
    
    #bottom-buttons {
        display: flex;
        align-items: center;
        justify-content: space-evenly;
        height: 50px;
    }
    
    #bottom-buttons > x-button {
        border-radius: 1000px;
        color: var(--text-color-on-secondary);
        background-color: var(--background-color-3);
        width: 20px;
        height: 20px;
    }
    
    #bottom-buttons > #heart-button[liked] {
        background-color: var(--love-color);
    }
    
    #bottom-buttons > #edit-button[active] {
        background-color: var(--secondary-color);
    }
    
    #bottom-buttons > #log-send-button[active] {
        background-color: var(--great-success-color);
    }
    
    #bottom-buttons > #star-button {
        /*transform: translate(-50%, 0);*/
    }
    
    #bottom-buttons > #star-button[active] {
        background-color: #BFA100;
    }
    
    #bottom-buttons > #turn-on-leds-button {
    }
    
    #bottom-buttons > #turn-on-leds-button[active] {
        background-color: var(--secondary-color);
    }
    
    #plus-button {
        background-color: var(--secondary-color);
    }
    
    yoffee-list-location-marker {
        display: none;
    }
</style>

<style>
    #route {
        background-image: ${WallImage == null ? null : `url(${WallImage})`};
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
        z-index: 1;
    }
    
    @keyframes loading {
        0% { width: 0; margin-left: 0; }
        50% { width: 100%; margin-left: 0; }
        100% { width: 0; margin-left: 100%; }
    }
</style>
` : ""}

<div id="header">
    <div id="top-row">
        <text-input id="route-name-input"
                    class="title-text header-input"
                    value=${() => GlobalState.selectedRoute?.name || "Configuring wall"}
                    changed=${() => () => saveRoute()}
                    submitted=${() => () => console.log("Submitted.")}
                    onfocus=${e => !e.target.selected && e.target.select()}
        ></text-input>
        
        ${() => !GlobalState.configuringHolds && html()`
        <div id="settings-button"
                  tabindex="0"
                  onkeydown=${() => e => e.stopPropagation()}
                  onmousedown=${() => () => {
                        let _dropdown = self.shadowRoot.querySelector("#settings-dialog")
                        let _button = self.shadowRoot.querySelector("#settings-button")
                        _dropdown.toggle(_button, true)
                    }}
                  onblur=${() => requestAnimationFrame(() => self.shadowRoot.querySelector("#settings-dialog").close())}>
            <x-icon icon="fa fa-bars"></x-icon>
        </div>
        <x-dialog id="settings-dialog">
            <div id="settings-container">
                <x-button class="settings-item"
                          onclick=${() => self.shadowRoot.querySelector("#route-name-input")?.focus()}>
                    <x-icon icon="fa fa-edit"></x-icon>
                    Edit route name
                </x-button>
                <x-button class="settings-item"
                          onclick=${async () => {
                              if (confirm(`Delete route ${GlobalState.selectedRoute.name}?`)) {
                                  await Api.deleteRoute(GlobalState.selectedRoute.id)
                                  await exitRoutePage()
                              }
                          }}>
                    <x-icon icon="fa fa-trash"></x-icon>
                    Delete route
                </x-button>
            </div>
        </x-dialog>
        `}
    </div>
    <div id="bottom-row">
        ${() => !GlobalState.configuringHolds && html()`
        <div id="setter-container">
            <div id="setter-prefix">Setter:</div>
            <x-button id="setter-button"
                      tabindex="0"
                      onmousedown=${() => () => {
                          let _dropdown = self.shadowRoot.querySelector("#setter-dialog")
                          let _button = self.shadowRoot.querySelector("#setter-button")
                          _dropdown.toggle(_button, true)
                      }}
                      onblur=${() => requestAnimationFrame(() => self.shadowRoot.querySelector("#setter-dialog").close())}>
                ${() => setterName()}
                <x-icon icon="fa fa-caret-down"></x-icon>
            </x-button>
        </div>
        <x-dialog id="setter-dialog"
                  class="header-dialog">
            ${() => [GlobalState.user, ...(GlobalState.selectedWall?.users || []).filter(user => user.id !== GlobalState.user.id)]
            .map(user => html()`
            <div class="item"
                 data-selected=${() => setterId() === user.id}
                 onclick=${async () => {
                     GlobalState.selectedRoute.setters = [{id: user.id, nickname: user.nickname}]
                     self.shadowRoot.querySelector("#setter-dialog").close()
                     await Api.updateRoute(GlobalState.selectedRoute.id, {setterId: user.id})
                 }}>
                ${GlobalState.user === user ? "Me" : user.nickname}
            </div>
            `)}
        </x-dialog>
        <div id="grade-container">
            <div id="grade-prefix">Grade:</div>
            <x-button id="grade-button"
                      tabindex="0"
                      onmousedown=${() => () => {
                            let _dropdown = self.shadowRoot.querySelector("#grade-dialog")
                            let _button = self.shadowRoot.querySelector("#grade-button")
                            _dropdown.toggle(_button, true)
                        }}
                      onblur=${() => requestAnimationFrame(() => self.shadowRoot.querySelector("#grade-dialog").close())}>
                V${() => GlobalState.selectedRoute?.grade}
                <x-icon icon="fa fa-caret-down"></x-icon>
            </x-button>
        </div>
        <x-dialog id="grade-dialog"
                  class="header-dialog">
            ${() => new Array(18).fill(0).map((_, index) => index + 1)
            .map(grade => html()`
                <div class="item"
                     data-selected=${() => grade === GlobalState.selectedRoute?.grade}
                     onclick=${async () => {
                         GlobalState.selectedRoute.grade = grade
                         self.shadowRoot.querySelector("#grade-dialog").close()
                         await Api.updateRoute(GlobalState.selectedRoute.id, {grade})
                     }}>
                V${grade}
            </div>
            `)}
        </x-dialog>
        `}
    </div>
</div>
<div id="route">
    <div id="holds-container"
         oncontextmenu = ${e => {
             e.preventDefault()
             e.stopPropagation() 
             e.stopImmediatePropagation()
         }}>
        ${() => GlobalState.holds
        .filter(hold => state.editMode || GlobalState.configuringHolds || hold.inRoute)
        .map(hold => html(hold)`
        <div class="hold"
             data-hold-type=${hold.inRoute ? (hold.holdType === "" ? "hold" : hold.holdType) : ""}
             style="${() => `
                left: ${hold.x * 100}%; 
                bottom: ${hold.y * 100}%; 
                `}"
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
</div>

<div id="bottom-buttons">
    ${() => !GlobalState.configuringHolds && html()`
    <x-button id="heart-button"
              liked=${() => GlobalState.selectedRoute?.liked} 
              onclick=${() => toggleLikeRoute(GlobalState.selectedRoute)}>
        <x-icon icon="fa fa-heart"></x-icon>
    </x-button>
    `}
    
    ${() => !GlobalState.configuringHolds && html()`
    <x-button id="star-button"
              active=${() => GlobalState.selectedRoute?.stars > 0}
              onclick=${async () => {
                  let stars = (GlobalState.selectedRoute.stars || 0) + 1
                  if (stars > 3) {
                      stars = 0
                  }
                  GlobalState.selectedRoute.stars = stars
                  await Api.setRouteStars(GlobalState.selectedRoute.id, stars)
              }}>
        <x-icon icon="fa fa-star"></x-icon>
        ${() => GlobalState.selectedRoute?.stars > 1 ? html()`<x-icon icon="fa fa-star"></x-icon>` : ""}
        ${() => GlobalState.selectedRoute?.stars > 2 ? html()`<x-icon icon="fa fa-star"></x-icon>` : ""}
    </x-button>
    `}
    
    ${() => !GlobalState.configuringHolds && html()`
    <x-button id="log-send-button"
              active=${() => GlobalState.selectedRoute?.sent}
              onclick=${() => toggleSentRoute(GlobalState.selectedRoute)}>
        <x-icon icon="fa fa-check"></x-icon>
    </x-button>
    `}
    
    ${() => !GlobalState.configuringHolds && html()`
    <x-button id="edit-button"
              active=${() => state.editMode}
              onclick=${async () => {
                  state.editMode = !state.editMode
                  if (state.editMode) {
                      if (!localStorage.getItem("edit_holds_toasted")) {
                          localStorage.setItem("edit_holds_toasted", "true")
                          showToast("Click holds to edit the route! long press to cycle start/finish hold")
                      }
                  }
              }}>
        <x-icon icon="fa fa-edit"></x-icon>
    </x-button>
    `}
    
    ${() => !GlobalState.configuringHolds && html()`
    <x-button id="turn-on-leds-button"
              active=${() => state.highlightingRoute}
              onclick=${async () => {
                  if (state.highlightingRoute) {
                      await Bluetooth.clearLeds()
                  } else {
                      await Bluetooth.highlightRoute(GlobalState.selectedRoute)
                  }
                  
                  state.highlightingRoute = !state.highlightingRoute
              }}>
        <x-icon icon="fa fa-lightbulb"></x-icon>
    </x-button>
    `}
    
    ${() => GlobalState.configuringHolds && html()`
    <x-button id="plus-button"
              onclick=${async () => {
                  let {hold} = await Api.createHold()
                  GlobalState.holdMapping.set(hold.id, hold)
                  GlobalState.holds = [...GlobalState.holds, hold]
              }}>
        <x-icon icon="fa fa-plus"></x-icon>
    </x-button>
    `}
</div>
`
})
