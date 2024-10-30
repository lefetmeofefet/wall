

import {queryNeo4j} from "../backend/db.js";

// let result = await queryNeo4j("create (n1:Hold{id: randomUUID()}) <-[e:includes]- (n2:Route)")
let result = await queryNeo4j("match (route:Route) return toInteger(route.grade)")

console.log(`Query result: ${JSON.stringify(result)}`)
