const State = {
    holds: [],
    routes: []
};

async function loadRoutesAndHolds() {
    const response = await fetch("/getDataPlz", {
        method: "POST",
        headers: Object.assign({
            "Content-Type": "application/json; charset=utf-8",
        }),
        body: {},
    });
    let data = await response.json()
    console.log("Responsje: ", data)
    State.holds = data.holds
    for (let hold of State.holds) {
        hold.yoffeeObj = Object.assign({}, hold)
    }
    State.routes = data.routes
    State.routes.forEach(r => r.holds.forEach(h => h.yoffeeObj = Object.assign({}, h)))
}

loadRoutesAndHolds()

export {State, loadRoutesAndHolds}