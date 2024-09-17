from vector import Vector
import uuid


class Hold(Vector):
    def __init__(self, x, y, hold_id=None):
        super().__init__(x, y)
        self.highlighted = False
        self.start_or_end_hold = False
        self.hold_id = hold_id

    def highlight(self, start_or_end_hold=False):
        self.highlighted = True
        self.start_or_end_hold = start_or_end_hold

    def unhighlight(self):
        self.highlighted = False
        self.start_or_end_hold = False

    def serialize(self):
        serialized = {"x": self.x, "y": self.y}
        if self.hold_id is not None:
            serialized["_id"] = self.hold_id
        return serialized

    @staticmethod
    def deserialize(serialized):
        return Hold(serialized["x"], serialized["y"], serialized["_id"])
