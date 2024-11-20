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
    constructor(id, name, grade, setter, holds) {
        this.id = id
        this.name = name
        this.grade = grade
        this.setter = setter

        /** @type {Hold[]} */
        this.holds = holds || []
        this.starred = false
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
