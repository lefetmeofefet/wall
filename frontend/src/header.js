import {html, createYoffeeElement} from "../libs/yoffee/yoffee.min.js"
import {
    GlobalState,
    loadRoutesAndHolds,
    enterConfigureHoldsPage,
    exitWall, snakeMeUp, setAutoLeds, updateTheme, signOut
} from "./state.js";
import "./components/text-input.js"
import "./components/x-button.js"
import "./components/x-icon.js"
import "./components/x-tag.js"
import {Api} from "./api.js";
import {showToast} from "../utilz/toaster.js";
import {loadFile} from "../utilz/load-file.js";
import {Bluetooth} from "./bluetooth.js";
import {enterFullscreen, exitFullscreen, isFullScreen} from "../utilz/fullscreen.js";
import {debounce} from "../utilz/debounce.js";


createYoffeeElement("header-bar", (props, self) => {
    let state = {
        searchMode: false
    }

    // Remember the filter value if going back to this page
    if (GlobalState.freeTextFilter != null) {
        state.searchMode = true
        self.onConnect = () => {
            self.shadowRoot.querySelector("#search").setValue(GlobalState.freeTextFilter)
        }
    }

    const updateSearch = search => {
        search = search?.trim()
        if (search === "") {
            search = null
        }
        if (GlobalState.freeTextFilter != search) {
            GlobalState.freeTextFilter = search
        }
    }
    const updateSearchDebounce = debounce(updateSearch, 300)

    let uploadImage = async () => {
        GlobalState.loading = true
        try {
            let file = await loadFile("image/*")
            console.log("Got file!")
            await Api.setWallImage(file)
            await loadRoutesAndHolds(true)
            showToast("Image updated!")
        } catch(e) {
        } finally {
            GlobalState.loading = false
        }
    }

    return html(GlobalState, state)`
<style>
    :host {
        position: relative;
        display: flex;
        gap: 15px;
        align-items: center;
        min-height: 83px;
    }
    
    #title {
        font-size: 55px;
        overflow: hidden;
    }
    
    @media (max-width: 380px) {
        #title {
            font-size: 45px;
        }
    }
    
    text-input#search {
        min-width: 0; /* Used to not squish other elements*/
        width: -webkit-fill-available;
        background-color: var(--background-color-3);
        border-radius: 100px;
        padding: 3px 5px;
        --selection-background: var(--secondary-color-weak-2);
    }
    
    text-input#search > x-icon {
        padding: 10px;
        --caret-color: var(--text-color);
        border-radius: 100px;
        cursor: pointer;
        width: 18px;
        height: 18px;
    }
    
    text-input#search > x-icon:hover {
        background-color: var(--hover-color);
    }
    
    #refresh-button {
        border-radius: 1000px;
        color: var(--text-color-weak-1);
        width: 15px;
        min-width: 15px;
        height: 30px;
        background-color: var(--text-color-weak-3);
    }
    
    #search-button {
        border-radius: 1000px;
        color: var(--text-color-weak-1);
        width: 15px;
        min-width: 15px;
        height: 30px;
        background-color: var(--text-color-weak-3);
    }
    
    x-switch {
        --circle-color: var(--secondary-color);
    }
    
    #settings-button {
        transition: 300ms;
        color: var(--text-color);
        cursor: pointer;
        padding: 19px 10px;
        font-size: 18px;
        border-bottom: 3px solid #00000000;
        display: flex;
        gap: 8px;
        -webkit-tap-highlight-color: transparent; /* Stops the blue background highlight */
        margin-left: auto;
    }
    
    #settings-button:hover {
        transition: 300ms;
        color: var(--secondary-color);
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
    
    #settings-container > #title {
        display: flex;
        font-size: 20px;
        padding: 10px;
        align-self: center;
        align-items: center;
    }
    
    #settings-container > #title > #edit-nickname-button {
        border-radius: 100px;
        box-shadow: none;
        font-size: 16px;
        opacity: 0.5;
        padding: 10px;
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
    
    yoffee-list-location-marker {
        display: none;
    }
</style>

${() => GlobalState.loading ? html()`
<style>
    /* Loader */
    :host::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        height: 2px;
        width: 0;
        background-color: var(--secondary-color);
        animation: loading 2s infinite;
    }
    
    @keyframes loading {
        0% { width: 0; margin-left: 0; }
        50% { width: 100%; margin-left: 0; }
        100% { width: 0; margin-left: 100%; }
    }
</style>
` : ""}

${() => state.searchMode ? html()`
<text-input id="search"
            onfocus=${e => !e.target.selected && e.target.select()}
            oninput=${e => updateSearchDebounce(e.target.value)}>
    <x-icon icon="fa fa-arrow-left"
            slot="before"
            onclick=${() => {
                state.searchMode = false
                updateSearch(null)
            }}
    ></x-icon>
    <x-icon icon="fa fa-times"
            slot="after"
            onclick=${() => {
                let search = self.shadowRoot.querySelector("#search")
                search.setValue("")
                search.focus()
                updateSearch(null)
            }}
    ></x-icon>
</text-input>
` : html()`
<div id="title">
    ${() => GlobalState.selectedWall == null ? "WHOL" : GlobalState.selectedWall.name}
</div>
${() => GlobalState.selectedWall != null && html()`
<x-button id="refresh-button"
          onclick=${async () => {
        await loadRoutesAndHolds()
    }}>
    <x-icon icon="fa fa-sync ${() => GlobalState.loading ? "fa-spin" : ""}"></x-icon>
</x-button>
<x-button id="search-button"
          onclick=${() => {
              state.searchMode = true
              self.shadowRoot.querySelector("#search")?.focus()
          }}>
    <x-icon icon="fa fa-search"></x-icon>
</x-button>
`}
`}
    

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
<!--    <x-icon icon="fa fa-ellipsis-v"></x-icon>-->
</div>

<x-dialog id="settings-dialog">
    <div id="settings-container">
        <div id="title" onclick=${() => async () => {
                let newNickname = prompt("Enter your new nickname: ")
                if (newNickname != null) {
                    await Api.setNickname(newNickname)
                    GlobalState.user = {...GlobalState.user, nickname: newNickname}
                }
            }}>
            Hi, ${() => GlobalState.user.nickname}!
            <x-button id="edit-nickname-button">
                <x-icon icon="fa fa-edit"></x-icon>
            </x-button>
        </div>
        <x-button class="settings-item"
                  onclick=${() => enterConfigureHoldsPage()}>
            <x-icon icon="fa fa-hand-rock"></x-icon>
            Configure Holds
        </x-button>
        <x-button class="settings-item"
                  onclick=${() => uploadImage()}>
            <x-icon icon="fa fa-file-image"></x-icon>
            Change wall image
        </x-button>
        <x-button class="settings-item"
                  onclick=${async () => {
                      let brightness = parseInt(prompt("Enter brightness from 0 to 100: "))
                      if (!isNaN(brightness)) {
                          let realBrightness = Math.round((brightness / 100) * 255)
                          await Bluetooth.setWallBrightness(realBrightness)
                          await Api.setWallBrightness(realBrightness)
                          GlobalState.selectedWall.brightness = realBrightness
                          GlobalState.selectedWall = {...GlobalState.selectedWall}
                      }
                  }}>
            <x-icon icon="fa fa-lightbulb"></x-icon>
            Brightness:
            <div style="margin-left: auto">
                ${() => Math.round((GlobalState.selectedWall?.brightness / 255) * 100)}%
            </div>
        </x-button>
        <div id="theme-toggle"
             class="settings-item">
            <x-icon icon=${() => GlobalState.darkTheme ? "fa fa-moon" : "fa fa-sun"}></x-icon>
            <div>Theme:</div>
            <x-switch value=${() => GlobalState.darkTheme}
                      style="--circle-size: 20px; margin-left: auto; padding-left: 10px;"
                      switched=${() => () => updateTheme(!GlobalState.darkTheme)}>
                 ${() => GlobalState.darkTheme ? "dark" : "light"}
            </x-switch>
        </div>
        <x-button class="settings-item"
                  id="fullscreen"
                  onclick=${() => {
                      isFullScreen() ? exitFullscreen() : enterFullscreen();
                      self.shadowRoot.querySelector("#settings-dialog").close()
                  }}>
            <x-icon icon="fa fa-expand"></x-icon>
            Toggle fullscreen
        </x-button>
        <x-button class="settings-item"
                  id="auto-leds">
            <x-icon icon="fa fa-bolt"></x-icon>
            <div>Auto leds</div>
            <x-switch value=${() => GlobalState.autoLeds}
                      style="--circle-size: 20px; margin-left: auto; padding-left: 10px;"
                      switched=${() => () => setAutoLeds(!GlobalState.autoLeds)}>
            </x-switch>
        </x-button>
        <x-button class="settings-item"
                  id="snakeio"
                  onclick=${() => snakeMeUp()}>
            <x-icon icon="fa fa-question"></x-icon>
            Snake me up
        </x-button>
        <x-button class="settings-item"
                  id="rename-wall"
                  onclick=${async () => {
                      let newWallName = prompt("What would you like to call your wall?")
                      if (newWallName != null) {
                          GlobalState.loading = true
                          try {
                              await Bluetooth.setWallName(newWallName)
                              await Api.setWallName(newWallName)
                              GlobalState.selectedWall.name = newWallName
                              GlobalState.selectedWall = {...GlobalState.selectedWall}
                          } finally {
                              GlobalState.loading = false
                          }
                      }
                  }}>
            <x-icon icon="fa fa-no-icon-fk"></x-icon>
            Rename wall
        </x-button>
        <x-button class="settings-item"
                  id="exit-wall"
                  onclick=${() => exitWall()}>
            <x-icon icon="fa fa-no-icon-fk"></x-icon>
            Exit wall
        </x-button>
        <x-button class="settings-item"
                  id="exit-wall"
                  onclick=${() => signOut()}>
            <x-icon icon="fa fa-sign-out-alt" style="transform: rotate(180deg)"></x-icon>
            Sign out
        </x-button>
    </div>
</x-dialog>
`
})