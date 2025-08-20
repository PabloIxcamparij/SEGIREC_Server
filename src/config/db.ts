import { Sequelize } from "sequelize-typescript";
import dotenv from 'dotenv'
dotenv.config()

const db = new Sequelize(process.env.Database_URL, {
    models : [__dirname + '/../models/**/*'],
    logging: false,
    dialectOptions: {
        ssl: {
            require: true, 
            rejectUnauthorized: false 
        }
    }
});

export default db;