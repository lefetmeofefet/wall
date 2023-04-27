import {html, createYoffeeElement} from "./libs/yoffee/yoffee.min.js"
import {State, loadRoutesAndHolds} from "./state.js"
import "./components/text-input.js"
import "./components/x-button.js"
import "./components/x-tag.js"
import * as api from "./api.js";


createYoffeeElement("route-page", (props, self) => {
    // We have to copy the route object to not modify the original object
    let route = {...props.route}
    route.holds = [...route.holds]
    let saveRoute = async () => {
        let routeName = self.shadowRoot.querySelector("#route-name-input").getValue()
        let routeGrade = self.shadowRoot.querySelector("#route-grade-input").getValue()
        await api.saveRoute(Object.assign(route, {
            name: routeName,
            grade: routeGrade
        }))

        await loadRoutesAndHolds();
        await backClicked()
    }

    let holdClicked = (hold) => {
        if (!hold.inRoute) {
            hold.inRoute = true
            hold.yoffeeObj.inRoute = true
            hold.startOrEndHold = false
            hold.yoffeeObj.startOrEndHold = false
            route.holds.push(hold);
            api.highlightHold(hold)
        } else if (hold.startOrEndHold) {
            hold.inRoute = false
            hold.yoffeeObj.inRoute = false
            hold.startOrEndHold = false
            hold.yoffeeObj.startOrEndHold = false
            route.holds = route.holds.filter(h => h.identifier !== hold.identifier);
            api.unhighlightHold(hold)
        } else {
            hold.startOrEndHold = true
            hold.yoffeeObj.startOrEndHold = true
            api.highlightHold(hold, true)
        }
    }

    for (let hold of route.holds) {
        let foundHold = State.holds.find(h => h.identifier === hold.identifier)
        foundHold.inRoute = true
        foundHold.yoffeeObj.inRoute = true
        if (hold.startOrEndHold) {
            foundHold.startOrEndHold = true
            foundHold.yoffeeObj.startOrEndHold = true
        }
    }

    api.highlightRoute()

    let backClicked = async () => {
        props.onbackclicked()
    }

    return html(State)`
    <style>
        :host {
            display: flex;
            flex-direction: column;
            height: -webkit-fill-available;
            overflow: hidden;
        }
        
        #header {
            display: flex;
            padding: 25px;
            background-color: var(--secondary-color);
            color: #eeeeee;
            align-items: center;
        }
        
        #route-name-input {
            max-width: 230px;
        }
        
        #header > .title-text {
            font-size: 20px;
            color: var(--text-color-on-secondary);
        }
        
        #header > text-input {
            --background-color: transparent;
            /*border: 1px solid #00000010;*/
        }
        
        #header > #v-div {
            margin-left: auto;
        }
        
        #header > #route-grade-input {
            --padding: 0;
            width: 40px;
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
            overflow: hidden;
            margin: 5px 10%;
            margin-bottom: 75px;
            height: inherit;
        }
        
        #holds-container > .hold {
            position: absolute;
            width: 15px;
            height: 15px;
            background-color: #00000050;
            border-radius: 100px;
            color: var(--text-color-on-secondary)
        }
        
        #save-button {
            border-radius: 1000px;
            position: fixed;
            right: 10%;
            bottom: 30px;
            color: var(--text-color-on-secondary);
            width: 30px;
            height: 30px;
            background-color: var(--secondary-color);
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
    
    <div id="header">
        <x-button id="back-button"
                  onclick=${() => backClicked()}>
            <x-icon icon="fa fa-caret-left"></x-icon>     
        </x-button>
        <text-input id="route-name-input"
                    class="title-text"
                    value=${() => route.name}
                    submitted=${() => () => console.log("Submitted.")}
        ></text-input>
        <div id="v-div" class="title-text">V</div>
        <text-input id="route-grade-input"
                    class="title-text"
                    value=${() => route.grade}
                    submitted=${() => () => console.log("Submitted.")}
        ></text-input>
    </div>
    <div id="holds-container">
        ${State.holds.map(hold => html(hold.yoffeeObj)`
        <div class="hold" 
             style="${() => `
                left: ${Math.floor(3 + hold.yoffeeObj.y * 92)}%; 
                bottom: ${Math.floor(3 + 92 - hold.yoffeeObj.x * 92)}%; 
                ${hold.yoffeeObj.inRoute && `background-color: ${hold.yoffeeObj.startOrEndHold ? "#20ff30" : "var(--secondary-color)"};`}`}"
             onclick=${() => holdClicked(hold)}></div>
        `)}
    </div>
    <x-button id="save-button"
              onclick=${() => saveRoute()}>
          <x-icon icon="fas fa-check"></x-icon>
    </x-button>
    <x-button id="delete-button"
              onclick=${async () => {
        if (confirm("U gonna destroy " + route.name + ". Proceed??")) {
            await api.deleteRoute()
            await loadRoutesAndHolds();
            await backClicked()
        }
    }}>
          <x-icon icon="fa fa-trash"></x-icon>
    </x-button>
    `

})
