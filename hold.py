from vector import Vector
import uuid


class Hold(Vector):
    def __init__(self, x, y, identifier=None):
        super().__init__(x, y)
        self.identifier = str(uuid.uuid4()) if identifier is None else identifier
        self.highlighted = False
        self.start_or_end_hold = False

    def highlight(self, start_or_end_hold=False):
        self.highlighted = True
        self.start_or_end_hold = start_or_end_hold

    def unhighlight(self):
        self.highlighted = False
        self.start_or_end_hold = False

    def serialize(self):
        return {"x": self.x, "y": self.y, "identifier": self.identifier}

    @staticmethod
    def deserialize(serialized):
        return Hold(serialized["x"], serialized["y"], serialized["identifier"])
