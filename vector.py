class Vector:
    def __init__(self, x=0, y=0):
        self.x = x
        self.y = y

    def set(self, other):
        self.x = other.x
        self.y = other.y

    def __sub__(self, other):
        return Vector(self.x - other.x, self.y - other.y)

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

    def __mul__(self, other):
        return Vector(self.x * other, self.y * other)

    def __getitem__(self, key):
        if key == 0:
            return self.x
        if key == 1:
            return self.y
        raise Exception("Bad bad index " + str(key))

    def __setitem__(self, key, value):
        if key == 0:
            self.x = value
        elif key == 1:
            self.y = value
        else:
            raise Exception("Bad bad index " + str(key))

    def serialize(self):
        return {"x": self.x, "y": self.y}

    @staticmethod
    def deserialize(serialized):
        return Vector(serialized["x"], serialized["y"])