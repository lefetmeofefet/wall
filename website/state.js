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
    State.routes = data.routes
}

loadRoutesAndHolds()

export {State, loadRoutesAndHolds}