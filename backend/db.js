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

async function getRoutes(whereClause, parameters) {
    return await readNeo4j(`
    MATCH (route:Route${whereClause || ""})
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
    `, parameters || {})
}

/** @returns {Promise<Route>} */
async function getRoute(id) {
    let result = await getRoutes(`{id: $id}`, {id})
    return result[0]
}

async function createRoute(setter) {
    return await queryNeo4jSingleResult(`
    CREATE (route:Route{
        id: randomUUID(),
        createdAt: timestamp(),
        name: "I AM ROUTE",
        setter: $setter,
        stars: 0,
        grade: 3
    })
    RETURN route.id as id,
           route.createdAt as createdAt,
           route.name as name, 
           route.grade as grade,
           route.setter as setter,
           route.stars as stars,
           [] as holds 
           
    `, {setter})
}

async function updateRoute(id, name, grade, setter) {
    await queryNeo4j(`
    MATCH (route:Route{id: $id})
    SET route.name = $name, route.grade = $grade, route.setter = $setter
    `, {id, name, grade, setter})
}

async function deleteRoute(id) {
    await queryNeo4j(`
    MATCH (route:Route{id: $id})
    DETACH DELETE route
    `, {id})
}

async function getHolds() {
    return await readNeo4j(`
    MATCH (hold:Hold)
    RETURN hold.id as id,
           hold.x as x,
           hold.y as y
    `)
}

async function createHold() {
    return await queryNeo4jSingleResult(`
    // We want sequential ids so we use Counter node
    MERGE (counter:Counter {name: "routeIdCounter"})
    ON CREATE SET counter.value = -1
    SET counter.value = counter.value + 1
    WITH counter.value AS newId
    
    CREATE (hold:Hold{
        id: newId,
        x: 0.5,
        y: 0.5
    })
    RETURN hold.id as id,
           hold.x as x,
           hold.y as y
    `)
}

async function moveHold(id, x, y) {
    await queryNeo4j(`
    MATCH (hold:Hold{id: $id})
    SET hold.x = $x, hold.y = $y
    `, {id, x, y})
}

async function deleteHold(id) {
    await queryNeo4j(`
    MATCH (hold:Hold{id: $id})
    DETACH DELETE hold
    `, {id})
}

async function addHoldToRoute(holdId, routeId, holdType) {
    await queryNeo4j(`
    MATCH (route:Route{id: $routeId}), (hold:Hold{id: $holdId})
    CREATE (route) -[:has{holdType: $holdType}]-> (hold)
    `, {holdId, routeId, holdType})
}

async function removeHoldFromRoute(holdId, routeId) {
    await queryNeo4j(`
    MATCH (route:Route{id: $routeId}) -[e:has]-> (hold:Hold{id: $holdId})
    DELETE e
    `, {holdId, routeId})
}

async function setRouteStars(id, stars) {
    await queryNeo4j(`
    MATCH (route:Route{id: $id})
    SET route.stars = $stars
    `, {id, stars})
}

export {
    queryNeo4j,
    readNeo4j,
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
