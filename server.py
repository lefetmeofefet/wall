from typing import Union
from fastapi.staticfiles import StaticFiles
import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
from starlette.responses import FileResponse
from starlette.responses import RedirectResponse
from threading import Thread
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
    [hold.highlight() for hold in wall.wall.holds if hold.identifier == req["hold_id"]]


@app.post("/highlight_route")
async def highlight_route(req: Dict):
    [hold.highlight() for hold in wall.wall.holds if hold.identifier in req["hold_ids"]]
    [hold.unhighlight() for hold in wall.wall.holds if hold.identifier not in req["hold_ids"]]


@app.post("/unhighlight_hold")
async def unhighlight_hold(req: Dict):
    [hold.unhighlight() for hold in wall.wall.holds if hold.identifier == req["hold_id"]]


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
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=False)
