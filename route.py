class Route:
    def __init__(self, name, grade, setter, identifier, holds):
        self.name = name
        self.grade = grade
        self.setter = setter
        self.identifier = identifier
        self.holds = holds

    def serialize(self):
        return {
            "name": self.name,
        }
