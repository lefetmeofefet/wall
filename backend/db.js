import neo4j from "neo4j-driver"
import {Config} from "./config.js";

let driver = neo4j.driver(
    Config.neo4j.uri,
    neo4j.auth.basic(Config.neo4j.user, Config.neo4j.password),
    {
        disableLosslessIntegers: true,
    }
)
const serverInfo = await driver.getServerInfo()
console.log('Connection to neo4j established: ', serverInfo)


async function queryNeo4j(query, params, options) {
    try{
        let result = await driver.executeQuery(
            query,
            params,
            options
        )
        return result.records.map(record => record.toObject())
    } catch (e) {
        // console.error(e)
        console.trace(e)
        throw `Error querying neo4j: ${e}`
    }
}

async function queryNeo4jSingleResult(query, params, options) {
    let results = await queryNeo4j(query, params, options)
    return results[0]
}

async function readNeo4j(query, params) {
    return await queryNeo4j(
        query,
        params,
        {routing: neo4j.routing.READ}
    )
}

async function readNeo4jSingleResult(query, params) {
    let results = await readNeo4j(query, params)
    return results[0]
}

async function getWallImage(wallId) {
    let result = await queryNeo4jSingleResult(`
    MERGE (wall:Wall{id: $wallId})
    ON CREATE SET wall.holdCounter = -1
    RETURN wall.image as image
    `, {wallId})
    return result.image
}

async function setWallImage(wallId, image) {
    return await queryNeo4jSingleResult(`
    MATCH (wall:Wall{id: $wallId})
    SET wall.image = $image
    `, {wallId, image})
}

async function getRoutes(wallId, whereClause, parameters) {
    return await readNeo4j(`
    MATCH (:Wall{id: $wallId}) -[:has]-> (route:Route${whereClause || ""})
    OPTIONAL MATCH (route)-[e]->(hold:Hold)
    WITH route, collect(hold) as holds, collect(e) as edges
    RETURN route.id as id,
           route.createdAt as createdAt,
           route.name as name, 
           route.grade as grade,
           route.setter as setter,
           route.stars as stars,
           [i IN range(0, size(holds) - 1) | {id: holds[i].id, holdType: edges[i].holdType}] AS holds
           //[h IN holds | {id: h.id, holdType: e.holdType}] AS holds
    ORDER BY route.createdAt ASC
    `, {wallId, ...(parameters || {})}
    )
}

/** @returns {Promise<Route>} */
async function getRoute(wallId, routeId) {
    let result = await getRoutes(wallId, `{id: $routeId}`, {routeId})
    return result[0]
}

async function createRoute(wallId, setter) {
    return await queryNeo4jSingleResult(`
    MATCH (wall:Wall{id: $wallId})
    CREATE (route:Route{
        id: randomUUID(),
        createdAt: timestamp(),
        name: "I AM ROUTE",
        setter: $setter,
        stars: 0,
        grade: 3
    })
    CREATE (wall) -[:has]-> (route)
    RETURN route.id as id,
           route.createdAt as createdAt,
           route.name as name, 
           route.grade as grade,
           route.setter as setter,
           route.stars as stars,
           [] as holds 
           
    `, {wallId, setter})
}

async function updateRoute(wallId, routeId, name, grade, setter) {
    await queryNeo4j(`
    MATCH (wall:Wall{id: $wallId}) -[:has]-> (route:Route{id: $routeId})
    SET route.name = $name, route.grade = $grade, route.setter = $setter
    `, {wallId, routeId, name, grade, setter})
}

async function deleteRoute(wallId, routeId) {
    await queryNeo4j(`
    MATCH (wall:Wall{id: $wallId}) -[:has]-> (route:Route{id: $routeId})
    DETACH DELETE route
    `, {wallId, routeId})
}

async function getHolds(wallId) {
    return await readNeo4j(`
    MATCH (wall:Wall{id: $wallId}) -[:has]-> (hold:Hold)
    RETURN hold.id as id,
           hold.x as x,
           hold.y as y
    `, {wallId})
}

async function createHold(wallId) {
    return await queryNeo4jSingleResult(`
    // We want sequential ids so we use Counter node
    MATCH (wall:Wall{id: $wallId})
    SET wall.holdCounter = wall.holdCounter + 1
    WITH wall
    
    CREATE (hold:Hold{
        id: wall.holdCounter,
        x: 0.5,
        y: 0.5
    })
    CREATE (wall) -[:has]-> (hold)
    RETURN hold.id as id,
           hold.x as x,
           hold.y as y
    `, {wallId})
}

async function moveHold(wallId, holdId, x, y) {
    await queryNeo4j(`
    MATCH (wall:Wall{id: $wallId}) -[:has]-> (hold:Hold{id: $holdId})
    SET hold.x = $x, hold.y = $y
    `, {wallId, holdId, x, y})
}

async function deleteHold(wallId, holdId) {
    await queryNeo4j(`
    MATCH (wall:Wall{id: $wallId}) -[:has]-> (hold:Hold{id: $holdId})
    DETACH DELETE hold
    `, {wallId, holdId})
}

async function addHoldToRoute(wallId, holdId, routeId, holdType) {
    await queryNeo4j(`
    MATCH (route:Route{id: $routeId}) <-[:has]- (wall:Wall{id: $wallId}) -[:has]-> (hold:Hold{id: $holdId})
    CREATE (route) -[:has{holdType: $holdType}]-> (hold)
    `, {wallId, holdId, routeId, holdType})
}

async function removeHoldFromRoute(wallId, holdId, routeId) {
    await queryNeo4j(`
    MATCH (route:Route{id: $routeId}) -[e:has]-> (hold:Hold{id: $holdId}) <-[:has]- (wall:Wall{id: $wallId})
    DELETE e
    `, {wallId, holdId, routeId})
}

async function setRouteStars(wallId, routeId, stars) {
    await queryNeo4j(`
    MATCH (wall:Wall{id: $wallId}) -[:has]-> (route:Route{id: $routeId})
    SET route.stars = $stars
    `, {wallId, routeId, stars})
}

export {
    queryNeo4j,
    readNeo4j,
    getWallImage,
    setWallImage,
    getRoutes,
    getRoute,
    createRoute,
    updateRoute,
    deleteRoute,
    getHolds,
    createHold,
    moveHold,
    deleteHold,
    addHoldToRoute,
    removeHoldFromRoute,
    setRouteStars
}
