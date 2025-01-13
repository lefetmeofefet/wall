import {html, createYoffeeElement} from "../../libs/yoffee/yoffee.min.js"
import {
    exitRoutePage,
    GlobalState,
    isAdmin,
    onBackClicked,
    toggleLikeRoute,
    toggleSentRoute,
    WallImage
} from "../state.js"
import {Api} from "../api.js"
import {showToast} from "../../utilz/toaster.js";
import {Bluetooth} from "../bluetooth.js";


createYoffeeElement("single-route-page", (props, self) => {
    let state = {
        editMode: GlobalState.selectedRoute?.isNew,
        editingTitle: false,
        highlightingRoute: GlobalState.autoLeds,
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

    const holdClicked = async (hold, isLongPress) => {
        if (!state.editMode) {
            showToast("Click the edit button to edit the route")
        }

        let holdWasInRoute = hold.inRoute

        if (state.editMode) {
            if (isLongPress) {
                if (hold.inRoute) {
                    // If it's in route, remove hold from route
                    hold.holdType = ""
                    hold.inRoute = false
                } else {
                    // If it's not in route, add it as finish hold
                    hold.holdType = "finish"
                    hold.inRoute = true
                }
            } else {
                if (!hold.inRoute) {
                    hold.inRoute = true
                    hold.holdType = ""
                } else if (hold.holdType === "") {
                    hold.holdType = "start"
                } else if (hold.holdType === "start") {
                    hold.holdType = "finish"
                } else if (hold.holdType === "finish") {
                    hold.holdType = ""
                    hold.inRoute = false
                }
            }

            // Set Bluetooth LED
            if (state.highlightingRoute) {
                await Bluetooth.setHoldState(hold)
            }

            // Update DB
            if (holdWasInRoute) {
                await Api.removeHoldFromRoute(hold.id, GlobalState.selectedRoute.id)
                if (hold.inRoute) {
                    // If we just change its type, we have to remove it to add it again with a different holdType
                    await Api.addHoldToRoute(hold.id, GlobalState.selectedRoute.id, hold.holdType)
                    GlobalState.selectedRoute.holds.find(h => h.id === hold.id).holdType = hold.holdType
                } else {
                    GlobalState.selectedRoute.holds = GlobalState.selectedRoute.holds.filter(h => h.id !== hold.id)
                }
            } else {
                await Api.addHoldToRoute(hold.id, GlobalState.selectedRoute.id, hold.holdType)
                GlobalState.selectedRoute.holds.push({id: hold.id, ledId: hold.ledId, holdType: hold.holdType})
            }
        }
    }

    return html(GlobalState, state, GlobalState.selectedRoute || {})`
<style>
    :host {
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: hidden;
    }
    
    #bottom-row {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    #bottom-row > #setter-container {
        display: flex;
        align-items: center;
        gap: 4px;
        height: 30px;
        font-size: 14px;
        opacity: 0.8;
        margin-left: 36px;
    }
    
    #setter-button {
        gap: 6px;
        padding: 1px 6px;
        box-shadow: none;
    }
    
    #bottom-row > #grade-container {
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
    
    .header-input {
        background-color: transparent;
        width: -webkit-fill-available;
        /*border: 1px solid #00000010;*/
    }
    
    wall-element {
    
    }
    
    #bottom-buttons {
        display: flex;
        align-items: center;
        justify-content: space-evenly;
        height: 50px;
        min-height: 44px;
    }
    
    #bottom-buttons > x-button {
        border-radius: 1000px;
        color: var(--text-color-weak);
        background-color: var(--background-color-3);
        width: 20px;
        height: 20px;
        gap: 10px;
    }
    
    #bottom-buttons > #heart-button[liked] {
        background-color: var(--love-color);
        color: var(--text-color-on-secondary);
    }
    
    #bottom-buttons > #edit-button[active] {
        background-color: var(--secondary-color);
        color: var(--text-color-on-secondary);
    }
    
    #bottom-buttons > #log-send-button[active] {
        background-color: var(--great-success-color);
        color: var(--text-color-on-secondary);
    }
    
    #bottom-buttons > #star-button {
        /*transform: translate(-50%, 0);*/
        font-size: 16px;
        gap: 0;
    }
    
    #bottom-buttons > #star-button[three-stars] {
        font-size: 14px;
    }
    
    #bottom-buttons > #star-button[active] {
        background-color: #BFA100;
        color: var(--text-color-on-secondary);
    }
    
    #bottom-buttons > #turn-on-leds-button {
    }
    
    #bottom-buttons > #turn-on-leds-button[active] {
        background-color: var(--secondary-color);
        color: var(--text-color-on-secondary);
    }
    
    #bottom-buttons > #finish-button {
        width: unset;
        background-color: var(--secondary-color);
    }
    
    yoffee-list-location-marker {
        display: none;
    }
</style>

<secondary-header showconfirmbutton=${() => state.editingTitle}>
    <text-input id="route-name-input"
                class="header-input"
                slot="title"
                disabled=${() => GlobalState.user.id !== setterId() && !isAdmin()}
                value=${() => GlobalState.selectedRoute?.name}
                changed=${() => async () => {
                    await saveRoute()
                }}
                onblur=${() => state.editingTitle = false}
                onfocus=${e => {
                    if (!e.target.selected) {
                        e.target.select()
                        state.editingTitle = true
                    }
                }}
    ></text-input>
    
    ${() => (GlobalState.user.id === setterId() || isAdmin()) && html()`
    <x-button slot="dialog-item"
              onclick=${() => self.shadowRoot.querySelector("#route-name-input")?.focus()}>
        <x-icon icon="fa fa-edit" style="width: 20px;"></x-icon>
        Edit route name
    </x-button>
    <x-button slot="dialog-item"
              onclick=${async () => {
                    if (confirm(`Delete route ${GlobalState.selectedRoute.name}?`)) {
                        await Api.deleteRoute(GlobalState.selectedRoute.id)
                        await exitRoutePage()
                    }
                }}>
        <x-icon icon="fa fa-trash" style="width: 20px;"></x-icon>
        Delete route
    </x-button>
    `}
    
    <div id="bottom-row"
         slot="bottom-row">
        <div id="setter-container">
            <div id="setter-prefix">Setter:</div>
            <x-button id="setter-button"
                      tabindex="0"
                      onmousedown=${() => () => {
                          if (GlobalState.user.id === setterId() || isAdmin()) {
                              let _dropdown = self.shadowRoot.querySelector("#setter-dialog")
                              let _button = self.shadowRoot.querySelector("#setter-button")
                              _dropdown.toggle(_button, true)
                          } else {
                              alert(`Cannot change route, owner is ${GlobalState.selectedRoute.setters[0]?.nickname}`)
                          }
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
                            if (GlobalState.user.id === setterId() || isAdmin()) {
                                let _dropdown = self.shadowRoot.querySelector("#grade-dialog")
                                let _button = self.shadowRoot.querySelector("#grade-button")
                                _dropdown.toggle(_button, true)
                            } else {
                                alert(`Cannot change route, owner is ${GlobalState.selectedRoute.setters[0]?.nickname}`)
                            }
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
    </div>
</secondary-header>

<wall-element showallholds=${() => state.editMode}
              onclickhold=${e => holdClicked(e.detail.hold, e.detail.long)}>
</wall-element>

<div id="bottom-buttons">
    ${() => state.editMode ? html()`
    <!-- Important for making justify-content: space-evenly work-->
    <div id="placeholder" style="width: 52px;"></div>
    <x-button id="finish-button"
              active
              onclick=${() => state.editMode = false}>
        <x-icon icon="fa fa-check"></x-icon>
        Finish editing
    </x-button>
    ` : html()`
    <x-button id="heart-button"
              liked=${() => GlobalState.selectedRoute?.liked} 
              onclick=${() => toggleLikeRoute(GlobalState.selectedRoute)}>
        <x-icon icon="fa fa-heart"></x-icon>
    </x-button>
    
    <x-button id="star-button"
              active=${() => GlobalState.selectedRoute?.stars > 0}
              three-stars=${() => GlobalState.selectedRoute?.stars === 3}
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
    
    <x-button id="log-send-button"
              active=${() => GlobalState.selectedRoute?.sent}
              onclick=${() => toggleSentRoute(GlobalState.selectedRoute)}>
        <x-icon icon="fa fa-check"></x-icon>
    </x-button>
    
    <x-button id="edit-button"
              active=${() => state.editMode}
              onclick=${async () => {
                  if (GlobalState.user.id === setterId() || isAdmin()) {
                      state.editMode = true
                      if (!localStorage.getItem("edit_holds_toasted")) {
                          localStorage.setItem("edit_holds_toasted", "true")
                          showToast("Click holds to edit the route, long press to remove hold")
                      }
                  } else {
                      alert(`Cannot change route, owner is ${GlobalState.selectedRoute.setters[0]?.nickname}`)
                  }
              }}>
        <x-icon icon="fa fa-edit"></x-icon>
    </x-button>
    
    `}
    
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
</div>
`
})
