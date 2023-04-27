from fastapi.staticfiles import StaticFiles
import uvicorn
from fastapi import FastAPI
from starlette.responses import RedirectResponse
from typing import Dict
from wall import start_wall_ui
import wall

app = FastAPI()
app.mount("/website", StaticFiles(directory="website", html=True), name="static")


@app.get("/")
async def index():
    # return FileResponse("website/index.html")
    return RedirectResponse("/website/index.html")


@app.post("/getDataPlz")
async def get_data_plzzzz():
    holds = [hold.serialize() for hold in wall.wall.holds]
    return {
        "routes": wall.routes,
        "holds": holds,
    }


@app.post("/highlight_hold")
async def highlight_hold(req: Dict):
    [hold.highlight(req["startOrEndHold"]) for hold in wall.wall.holds if hold.identifier == req["holdId"]]


@app.post("/highlightRoute")
async def highlight_route(req: Dict):
    for hold in wall.wall.holds:
        should_unhighlight = True
        for route_hold in req["holds"]:
            if hold.identifier == route_hold["identifier"]:
                hold.highlight(start_or_end_hold="startOrEndHold" in route_hold and route_hold["startOrEndHold"])
                should_unhighlight = False
        if should_unhighlight:
            hold.unhighlight()


@app.post("/unhighlight_hold")
async def unhighlight_hold(req: Dict):
    [hold.unhighlight() for hold in wall.wall.holds if hold.identifier == req["holdId"]]


@app.post("/unhighlight_all_holds")
async def unhighlight_all_holds():
    [hold.unhighlight() for hold in wall.wall.holds]


@app.post("/saveRoute")
async def save_route(req: Dict):
    existing_route = [route for route in wall.routes if route["identifier"] == req["identifier"]]
    if len(existing_route) > 0:
        wall.routes = [route for route in wall.routes if route["identifier"] != req["identifier"]]

    # We're using insert instead of append to make the new route pop up at the top of the list
    wall.routes.insert(0, {
        "name": req["name"],
        "grade": req["grade"],
        "setter": req["setter"],
        "identifier": req["identifier"],
        "holds": req["holds"],
    })


@app.post("/deleteRoute")
async def delete_route(req: Dict):
    wall.routes = [route for route in wall.routes if route["identifier"] != req["identifier"]]


if __name__ == "__main__":
    start_wall_ui()
    uvicorn.run("server:app", host="0.0.0.0", port=80, reload=False)
