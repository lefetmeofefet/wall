class Wall {
    constructor(id, name, brightness) {
        this.id = id
        this.name = name
        this.brightness = brightness
    }

    fromDb(dbObject) {

    }
}

class Route {
    constructor(id, name, grade, setter, holds, createdAt) {
        this.id = id
        this.name = name
        this.grade = grade
        this.setter = setter
        this.createdAt = createdAt

        /** @type {Hold[]} */
        this.holds = holds || []
        this.stars = 0
    }

    fromDb(dbObject) {

    }
}

class Hold {
    constructor(id, x, y, name) {
        this.id = id
        this.x = x
        this.y = y
        this.name = name
        this.inRoute = false
        this.holdType = ""
    }

    fromDb(dbObject) {

    }
}
