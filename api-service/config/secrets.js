import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const KAFKA_HOST = process.env.KAFKA_HOST;
const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;
const NODE_ENV = process.env.NODE_ENV;

export { JWT_SECRET, KAFKA_HOST, PORT, FRONTEND_URL, NODE_ENV };
