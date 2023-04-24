import {html,  createYoffeeElement} from "./libs/yoffee/yoffee.min.js"
import {State, loadRoutesAndHolds} from "./state.js"
import "./components/text-input.js"
import "./components/x-button.js"
import "./components/x-tag.js"


createYoffeeElement("route-page", (props, self) => {
    // We have to copy the route object to not modify the original object
    let route = {...props.route}
    route.holds = [...route.holds]
    let saveRoute = async () => {
        let routeName = self.shadowRoot.querySelector("#route-name-input").getValue()
        let routeGrade = self.shadowRoot.querySelector("#route-grade-input").getValue()
        await fetch("/saveRoute", {
            method: "POST",
            headers: Object.assign({
                "Content-Type": "application/json; charset=utf-8",
            }),
            body: JSON.stringify(Object.assign(route, {
                name: routeName,
                grade: routeGrade
            })),
        });
        await loadRoutesAndHolds();
        await backClicked()
    }

    let deleteRoute = async () => {
        await fetch("/deleteRoute", {
            method: "POST",
            headers: Object.assign({
                "Content-Type": "application/json; charset=utf-8",
            }),
            body: JSON.stringify({identifier: route.identifier}),
        });
        await loadRoutesAndHolds();
        await backClicked()
    }

    let holdClicked = (hold) => {
        hold.selected = !hold.selected
        if (hold.selected) {
            route.holds.push(hold);
            highlightHold(hold)
        } else {
            route.holds = route.holds.filter(h => h.identifier !== hold.identifier);
            unhighlightHold(hold)
        }
    }

    let highlightHold = async (hold) => {
        await fetch("/highlight_hold", {
            method: "POST",
            headers: Object.assign({
                "Content-Type": "application/json",
            }),
            body: JSON.stringify({hold_id: hold.identifier})
        });
    }


    for (let hold of route.holds) {
        let foundHold = State.holds.find(h => h.identifier === hold.identifier)
        foundHold.selected = true
    }
    fetch("/highlight_route", {
        method: "POST",
        headers: Object.assign({
            "Content-Type": "application/json",
        }),
        body: JSON.stringify({hold_ids: route.holds.map(h => h.identifier)})
    });

    let unhighlightHold = async (hold) => {
        await fetch("/unhighlight_hold", {
            method: "POST",
            headers: Object.assign({
                "Content-Type": "application/json; charset=utf-8",
            }),
            body: JSON.stringify({hold_id: hold.identifier}),
        });
    }

    let unhighlightAllHolds = async (hold) => {
        await fetch("/unhighlight_all_holds", {
            method: "POST",
            headers: Object.assign({
                "Content-Type": "application/json; charset=utf-8",
            }),
            body: {},
        });
    }

    let backClicked = async () => {
        for (let hold of State.holds) {
            hold.selected = false
        }
        await unhighlightAllHolds();
        props.onbackclicked()
    }

    return html(route, State)`
    <style>
        :host {
            display: flex;
            flex-direction: column;
            height: -webkit-fill-available;
            overflow: hidden;
        }
        
        #header {
            display: flex;
            height: 80px;
            padding: 30px;
            background-color: var(--secondary-color);
            color: #eeeeee;
            align-items: center;
        }
        
        #header > .title-text {
            font-size: 34px;
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
        }
        
        #holds-container {
            position: relative;
            height: 60%;
            overflow: hidden;
            margin: 20px 10%;
        }
        
        #holds-container > .hold {
            position: absolute;
            width: 15px;
            height: 15px;
            background-color: var(--secondary-color);
            border-radius: 100px;
            color: var(--text-color-on-secondary)
        }
        
        #save-button {
            border-radius: 1000px;
            position: fixed;
            right: 10%;
            bottom: 50px;
            color: var(--text-color-on-secondary);
            width: 30px;
            height: 30px;
            background-color: var(--secondary-color);
        }
        
        #delete-button {
            border-radius: 1000px;
            position: fixed;
            left: 10%;
            bottom: 50px;
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
        ${State.holds.map(hold => html(hold)`
        <div class="hold" 
             style="${() => `left: ${Math.floor(3 + hold.y * 92)}%; bottom: ${Math.floor(3 + 92 - hold.x * 92)}%; ${hold.selected && "background-color: red"}`}"
             onclick=${() => holdClicked(hold)}></div>
        `)}
    </div>
    <x-button id="save-button"
              onclick=${() => saveRoute()}>
          <x-icon icon="fas fa-check"></x-icon>
    </x-button>
    <x-button id="delete-button"
              onclick=${() => confirm("U gonna destroy " + route.name + ". Proceed??") && deleteRoute()}>
          <x-icon icon="fa fa-trash"></x-icon>
    </x-button>
    `

})
