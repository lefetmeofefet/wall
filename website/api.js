async function post(url, data) {
    let res = await fetch(url, {
        method: "POST",
        headers: Object.assign({
            "Content-Type": "application/json; charset=utf-8",
        }),
        body: data == null ? {} : JSON.stringify(data),
    });
    return res.json()
}

async function unhighlightAllHolds() {
    await post("/unhighlight_all_holds")
}

async function highlightHold(hold, startOrEndHold) {
    await post("/highlight_hold", {holdId: hold.identifier, startOrEndHold: startOrEndHold});
}

async function unhighlightHold(hold) {
    await post("/unhighlight_hold", {holdId: hold.identifier});
}

async function deleteRoute(route) {
    await post("/deleteRoute", {identifier: route.identifier});
}

async function saveRoute(route) {
    await post("/saveRoute", route);
}

async function highlightRoute(route) {
    await post("/highlightRoute", {holds: route.holds});
}


export {unhighlightAllHolds, highlightHold, unhighlightHold, deleteRoute, saveRoute, highlightRoute}


