from vector import Vector
import uuid


class Hold(Vector):
    def __init__(self, x, y, identifier=None):
        super().__init__(x, y)
        self.identifier = str(uuid.uuid4()) if identifier is None else identifier
        self.highlighted = False

    def highlight(self):
        self.highlighted = True

    def unhighlight(self):
        self.highlighted = False

    def serialize(self):
        return {"x": self.x, "y": self.y, "identifier": self.identifier}

    @staticmethod
    def deserialize(serialized):
        return Hold(serialized["x"], serialized["y"], serialized["identifier"])
