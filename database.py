from pymongo import MongoClient

from hold import Hold
from vector import Vector

client = MongoClient('mongodb+srv://shlomogdd:shl0m01234@iamcluster.hszlfq1.mongodb.net/')

db = client['wall']

hole_collection = db['holes']
route_collection = db['routes']
corner_collection = db['corners']


def save_wall_in_database(wall, routes):
    hole_collection.delete_many({})
    route_collection.delete_many({})
    corner_collection.delete_many({})

    hole_collection.insert_many([hold.serialize() for hold in wall.holds])

    route_collection.insert_many([{
        "name": route["name"],
        "grade": route["grade"],
        "setter": route["setter"],
        "holds": [{"holdId": hold["holdId"],
                   "isStartOrEndHold": False if "startOrEndHold" not in hold else hold["startOrEndHold"]} for hold in
                  route["holds"]]
    } for route in routes
    ])

    corners = {
        "top_right": wall.corner_top_right.serialize(),
        "top_left": wall.corner_top_left.serialize(),
        "bottom_right": wall.corner_bottom_right.serialize(),
        "bottom_left": wall.corner_bottom_left.serialize()
    }
    corner_collection.insert_one(corners)


def add_route_to_database(route):
    route_collection.delete_one(route)
    route_collection.insert_one({
        "name": route["name"],
        "grade": route["grade"],
        "setter": route["setter"],
        "holds": [{"holdId": hold["holeId"],
                   "isStartOrEndHold": False if "startOrEndHold" not in hold else hold["startOrEndHold"]} for hold in
                  route["holds"]]})


def load_wall_from_database():
    holds = []
    for serialized_hold in hole_collection.find():
        holds.append(Hold.deserialize(serialized_hold))

    routes = []
    for route in route_collection.find():
        routes.append(route)
        print(route)  # ToDo remove, this is just to show
    corners = []
    for corner in corner_collection.find():
        corners.append(corner)

    corner_top_right = Vector.deserialize(corners[0]["top_right"])
    corner_top_left = Vector.deserialize(corners[0]["top_left"])
    corner_bottom_right = Vector.deserialize(corners[0]["bottom_right"])
    corner_bottom_left = Vector.deserialize(corners[0]["bottom_left"])
    corners = [corner_top_right, corner_top_left, corner_bottom_right,
               corner_bottom_left]

    return holds, routes, corners
