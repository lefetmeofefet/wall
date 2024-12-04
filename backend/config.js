import dotenv from 'dotenv';
import path from 'path';
import fs from "fs";


function findEnvFile() {
    let currentDir = process.cwd();

    while (true) {
        const envPath = path.join(currentDir, '.env')
        if (fs.existsSync(envPath)) {
            return envPath
        }

        const parentDir = path.dirname(currentDir);

        // If we've reached the root directory, stop
        if (currentDir === parentDir) {
            return null; // .env file not found
        }
        currentDir = parentDir;
    }
}

// Load the .env file
dotenv.config({
    path: findEnvFile(),
    override: true,
});

const Config = {
    prod: process.env.NODE_ENV?.toLowerCase() === "production" || process.env.NODE_ENV?.toLowerCase() === "prod",
    port: process.env.PORT || 8080,
    hostname: process.env.HOSTNAME || "0.0.0.0",
    neo4j: {
        uri: process.env.NEO4J_URI,
        user: process.env.NEO4J_USER,
        password: process.env.NEO4J_PASSWORD,
        database: process.env.NEO4J_DATABASE,
    },
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    JWTPrivateKey: process.env.JWT_PRIVATE_KEY,
}


export {Config}
