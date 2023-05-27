from threading import Thread
import _thread
import arcade
import math
import json
import os

import database
from hold import Hold
from vector import Vector
import os

CORNER_WIDTH = 30
HOLD_RADIUS = 15
SAVE_FILE_PATH = "wall.json"
os.environ['PYGLET_SHADOW_WINDOW']="0"


class Wall(arcade.Window):
    def __init__(self):
        super().__init__(1, 1, "I AM WALL", fullscreen=True)
        arcade.set_background_color((80, 80, 80))
        width, height = self.get_size()
        self.corner_top_right = Vector(width - CORNER_WIDTH / 2, height - CORNER_WIDTH / 2)
        self.corner_top_left = Vector(CORNER_WIDTH / 2, height - CORNER_WIDTH / 2)
        self.corner_bottom_right = Vector(width - CORNER_WIDTH / 2, CORNER_WIDTH / 2)
        self.corner_bottom_left = Vector(CORNER_WIDTH / 2, CORNER_WIDTH / 2)

        self.holds = []
        #
        global routes

        self.holds, routes, self.corners = database.load_wall_from_database()
        self.corner_top_right = self.corners[0]
        self.corner_top_left = self.corners[1]
        self.corner_bottom_right = self.corners[2]
        self.corner_bottom_left = self.corners[3]

        # ToDo DAVDAVDAVDAVIT - use the gray codfe once t oload the file into the database
        # if os.path.exists(SAVE_FILE_PATH):
        #     with open(SAVE_FILE_PATH, 'r') as openfile:
        #         serialized_wall = json.load(openfile)
        #         for serialized_hold in serialized_wall["holds"]:
        #             self.holds.append(Hold.deserialize(serialized_hold))
        #         # global routes
        #         routes = serialized_wall["routes"]
        #         print(routes)
        #         corners = serialized_wall["corners"]
        #         self.corner_top_right = Vector.deserialize(corners["top_right"])
        #         self.corner_top_left = Vector.deserialize(corners["top_left"])
        #         self.corner_bottom_right = Vector.deserialize(corners["bottom_right"])
        #         self.corner_bottom_left = Vector.deserialize(corners["bottom_left"])
        # else:
        #     num_holds = 0
        #     for y in range(num_holds):
        #         for x in range(num_holds):
        #             if (x == 0 or x == num_holds - 1) and (y == 0 or y == num_holds - 1):
        #                 continue
        #             self.holds.append(Hold(x / (num_holds - 1), y / (num_holds - 1)))
        # self.corners = [self.corner_top_right, self.corner_top_left, self.corner_bottom_right,
        #                 self.corner_bottom_left]
        #
        self.dragged_corner = None
        self.dragged_hold = None

    def on_draw(self):
        self.clear()
        for corner in self.corners:
            arcade.draw_rectangle_filled(corner.x, corner.y, CORNER_WIDTH, CORNER_WIDTH, (255, 255, 255))
        are_there_highlighted_holds = len([hold for hold in self.holds if hold.highlighted]) > 0

        for hold in self.holds:
            radius = HOLD_RADIUS
            hold_xy = self.convert_wall_to_screen_coordinates(hold.x, hold.y)
            color = (255, 255, 255)
            if are_there_highlighted_holds and not hold.highlighted:
                color = (0, 0, 0, 0)
            if hold.highlighted and hold.start_or_end_hold:
                radius *= 1.5
            arcade.draw_circle_filled(hold_xy.x, hold_xy.y, radius, color)

    def convert_wall_to_screen_coordinates(self, x, y):
        top_vector = self.corner_top_right - self.corner_top_left
        bottom_vector = self.corner_bottom_right - self.corner_bottom_left
        left_vector = self.corner_top_left - self.corner_bottom_left
        right_vector = self.corner_top_right - self.corner_bottom_right

        top_spot = self.corner_top_left + top_vector * x
        bottom_spot = self.corner_bottom_left + bottom_vector * x
        left_spot = self.corner_bottom_left + left_vector * y
        right_spot = self.corner_bottom_right + right_vector * y

        # ax + by = c for both vertical and horizontal lines
        a_horizontal = right_spot.y - left_spot.y
        b_horizontal = left_spot.x - right_spot.x
        c_horizontal = a_horizontal * left_spot.x + b_horizontal * left_spot.y

        a_vertical = top_spot.y - bottom_spot.y
        b_vertical = bottom_spot.x - top_spot.x
        c_vertical = a_vertical * bottom_spot.x + b_vertical * bottom_spot.y

        delta = a_horizontal * b_vertical - a_vertical * b_horizontal
        new_x = (b_vertical * c_horizontal - b_horizontal * c_vertical) / delta
        new_y = (a_horizontal * c_vertical - a_vertical * c_horizontal) / delta

        return Vector(new_x, new_y)

    def convert_screen_to_wall_coordinates(self, x, y):
        current_x = 0.5
        current_y = 0.5
        delta = 0.25
        screen_coords = self.convert_wall_to_screen_coordinates(current_x, current_y)

        while delta > 0.001:
            if screen_coords.x < x:
                while screen_coords.x < x:
                    current_x += delta
                    screen_coords = self.convert_wall_to_screen_coordinates(current_x, current_y)

            else:
                while screen_coords.x > x:
                    current_x -= delta
                    screen_coords = self.convert_wall_to_screen_coordinates(current_x, current_y)

            if screen_coords.y < y:
                while screen_coords.y < y:
                    current_y += delta
                    screen_coords = self.convert_wall_to_screen_coordinates(current_x, current_y)
            else:
                while screen_coords.y > y:
                    current_y -= delta
                    screen_coords = self.convert_wall_to_screen_coordinates(current_x, current_y)
            delta /= 2
        return Vector(current_x, current_y)

    # def convert_screen_to_wall_coordinates(self, x, y):
    #     vector_top_left = Vector(self.corner_top_left)
    #     vector_top_right = Vector(self.corner_top_right)
    #     vector_bottom_left = Vector(self.corner_bottom_left)
    #     vector_bottom_right = Vector(self.corner_bottom_right)
    #
    #     top_vector = vector_top_right - vector_top_left
    #     bottom_vector = vector_bottom_right - vector_bottom_left
    #     left_vector = vector_top_left - vector_bottom_left
    #     right_vector = vector_top_right - vector_bottom_right
    #
    #     a = vector_bottom_left.x
    #     b = vector_bottom_right.x
    #     c = vector_top_left.x
    #     d = vector_top_right.x
    #     e = vector_bottom_left.y
    #     f = vector_bottom_right.y
    #     g = vector_top_left.y
    #     h = vector_top_right.y
    #
    #     i = top_vector.x
    #     j = bottom_vector.x
    #     k = left_vector.x
    #     l = right_vector.x
    #     m = top_vector.y
    #     n = bottom_vector.y
    #     o = left_vector.y
    #     p = right_vector.y
    #
    #     # q = x
    #     # r = y
    #     # q = (((a + j * x) - (c + i * x)) * (((f + p * y) - (e + o * y)) * (a + k * y) + ((a + k * y) - (b + l * y)) * (e + o * y)) - ((a + k * y) - (b + l * y)) * (((g + m * x) - (e + n * x)) * (a + j * x) + ((a + j * x) - (c + i * x)) * (e + n * x))) / (((f + p * y) - (e + o * y)) * ((a + j * x) - (c + i * x)) - ((g + m * x) - (e + n * x)) * ((a + k * y) - (b + l * y)))
    #     q = ((a + j * x - (c + i * x)) * (
    #                 (f + p * y - (e + o * y)) * (a + k * y) + (a + k * y - (b + l * y)) * (e + o * y)) - (
    #                      a + k * y - (b + l * y)) * (
    #                      (g + m * x - (e + n * x)) * (a + j * x) + (a + j * x - (c + i * x)) * (e + n * x))) / (
    #                     (f + p * y - (e + o * y)) * (a + j * x - (c + i * x)) - (g + m * x - e - n * x) * (
    #                         a + k * y - b - l * y))
    #
    #     new_y =
    #
    #     r = (((f + p * y) - (e + o * y)) * (((g + m * x) - (e + n * x)) * (a + j * x) + ((a + j * x) - (c + i * x)) * (e + n * x)) - ((g + m * x) - (e + n * x)) * (((f + p * y) - (e + o * y)) * (a + k * y) + ((a + k * y) - (b + l * y)) * (e + o * y))) / (((f + p * y) - (e + o * y)) * ((a + j * x) - (c + i * x)) - ((g + m * x) - (e + n * x)) * ((a + k * y) - (b + l * y)))
    #
    #     # return [new_x, new_y]
    #     return [q, r]
    #
    # def convert_screen_to_wall_coordinates_oldddd(self, x, y):
    #     vector_top_left = Vector(self.corner_top_left)
    #     vector_top_right = Vector(self.corner_top_right)
    #     vector_bottom_left = Vector(self.corner_bottom_left)
    #     vector_bottom_right = Vector(self.corner_bottom_right)
    #
    #     top_vector = vector_top_right - vector_top_left
    #     bottom_vector = vector_bottom_right - vector_bottom_left
    #     left_vector = vector_top_left - vector_bottom_left
    #     right_vector = vector_top_right - vector_bottom_right
    #
    #     x_00 = vector_bottom_left.x
    #     x_10 = vector_bottom_right.x
    #     x_01 = vector_top_left.x
    #     x_11 = vector_top_right.x
    #     y_00 = vector_bottom_left.y
    #     y_10 = vector_bottom_right.y
    #     y_01 = vector_top_left.y
    #     y_11 = vector_top_right.y
    #
    #     x_t = top_vector.x
    #     x_b = bottom_vector.x
    #     x_l = left_vector.x
    #     x_r = right_vector.x
    #     y_t = top_vector.y
    #     y_b = bottom_vector.y
    #     y_l = left_vector.y
    #     y_r = right_vector.y
    #
    #     new_x = (((x_00 + x_b * x) - (x_01 + x_t * x)) * (((y_10 + y_r * y) - (y_00 + y_l * y)) * (x_00 + x_l * y) + ((x_00 + x_l * y) - (x_10 + x_r * y)) * (y_00 + y_l * y)) - ((x_00 + x_l * y) - (x_10 + x_r * y)) * (((y_01 + y_t * x) - (y_00 + y_b * x)) * (x_00 + x_b * x) + ((x_00 + x_b * x) - (x_01 + x_t * x)) * (y_00 + y_b * x))) / (((y_10 + y_r * y) - (y_00 + y_l * y)) * ((x_00 + x_b * x) - (x_01 + x_t * x)) - ((y_01 + y_t * x) - (y_00 + y_b * x)) * ((x_00 + x_l * y) - (x_10 + x_r * y)))
    #     new_y = (((y_10 + y_r * y) - (y_00 + y_l * y)) * (
    #             ((y_01 + y_t * x) - (y_00 + y_b * x)) * (
    #             x_00 + x_b * x) + (
    #                     (x_00 + x_b * x) - (x_01 + x_t * x)) * (
    #                     y_00 + y_b * x)) - (
    #                      (y_01 + y_t * x) - (y_00 + y_b * x)) * (
    #                      ((y_10 + y_r * y) - (
    #                              y_00 + y_l * y)) * (
    #                              x_00 + x_l * y) + (
    #                              (
    #                                      x_00 + x_l * y) - (
    #                                      x_10 + x_r * y)) * (
    #                              y_00 + y_l * y))) / (
    #                     ((y_10 + y_r * y) - (y_00 + y_l * y)) * (
    #                     (x_00 + x_b * x) - (x_01 + x_t * x)) - (
    #                             (y_01 + y_t * x) - (
    #                             y_00 + y_b * x)) * (
    #                             (x_00 + x_l * y) - (
    #                             x_10 + x_r * y)))
    #
    #     return [new_x, new_y]

    def on_mouse_motion(self, x, y, dx, dy):
        # Move the center of the player sprite to match the mouse x, y
        if self.dragged_corner is not None:
            self.dragged_corner.x = x
            self.dragged_corner.y = y

        if self.dragged_hold is not None:
            wall_xy = self.convert_screen_to_wall_coordinates(x, y)
            self.dragged_hold.x = wall_xy.x
            self.dragged_hold.y = wall_xy.y

    def on_mouse_press(self, x, y, button, modifiers):
        for corner in self.corners:
            if abs(x - corner.x) <= CORNER_WIDTH / 2 and abs(y - corner.y) <= CORNER_WIDTH / 2:
                self.dragged_corner = corner

        for hold in self.holds:
            hold_xy = self.convert_wall_to_screen_coordinates(hold[0], hold[1])
            if math.sqrt((x - hold_xy.x) * (x - hold_xy.x) + (y - hold_xy.y) * (y - hold_xy.y)) <= HOLD_RADIUS:
                self.dragged_hold = hold
        if button == arcade.MOUSE_BUTTON_LEFT:
            print("Left mouse button pressed at", x, y)
        elif button == arcade.MOUSE_BUTTON_RIGHT:
            if self.dragged_hold is None:
                mouse_wall_xy = self.convert_screen_to_wall_coordinates(x, y)
                self.holds.append(Hold(mouse_wall_xy.x, mouse_wall_xy.y))
            else:
                self.holds.remove(self.dragged_hold)
                self.dragged_hold = None

    def on_mouse_release(self, x, y, button, modifiers):
        self.dragged_corner = None
        self.dragged_hold = None

    def on_update(self, delta_time):
        pass


wall = None
routes = [
    {
        "name": "Jug life",
        "grade": "3",
        "setter": "Daweet",
        "identifier": "1",
        "holds": []
    }, {
        "name": "Shrimp the Crimp",
        "grade": "5",
        "setter": "Darvit",
        "identifier": "2",
        "holds": []
    }, {
        "name": "Couch batata",
        "grade": "4",
        "setter": "Dahooid",
        "identifier": "3",
        "holds": []
    }, {
        "name": "The meaning of Wife",
        "grade": "8",
        "setter": "me",
        "identifier": "4",
        "holds": []
    }, {
        "name": "JMP",
        "grade": "8",
        "setter": "me",
        "identifier": "5",
        "holds": []
    }, {
        "name": "Flordflorp",
        "grade": "13",
        "setter": "shlrmek",
        "identifier": "6",
        "holds": []
    }
]


def start_wall_thread():
    global wall
    wall = Wall()
    arcade.run()
    print("LaLAlAlA")

    # After window is closed, save shit
    # serialized_wall = json.dumps({
    #     "holds": [hold.serialize() for hold in wall.holds],
    #     "routes": routes,
    #     "corners": {
    #         "top_right": wall.corner_top_right.serialize(),
    #         "top_left": wall.corner_top_left.serialize(),
    #         "bottom_right": wall.corner_bottom_right.serialize(),
    #         "bottom_left": wall.corner_bottom_left.serialize(),
    #     }
    # })

    database.save_wall_in_database(wall, routes)

    # EXAMPLE CODE FOR HOW TO ADD A ROUTE TO THE THING _ DAVDAVDAVDAVIT
    # temp_route = {
    #     "name": "test route",
    #     "grade": "25",
    #     "setter": "tester",
    #     "holds": []
    # }
    # database.add_route_to_database(temp_route)

    # with open(SAVE_FILE_PATH, "w") as file:
    #     file.write(serialized_wall)
    # exit()


def start_wall_ui():
    # thread = Thread(target=start_wall_thread, args=(wall_container,))
    # thread.start()
    _thread.start_new_thread(start_wall_thread, ())


if __name__ == '__main__':
    start_wall_thread()
