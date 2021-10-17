import dontenv from "dotenv";
import path from "path";
import { validateEnv } from "./utils";

dontenv.config({ path: path.join(__dirname, ".env") });

const env = validateEnv(process.env);

const config = {
	server: {
		port: env.SERVER_PORT
	},
	db: {
		host: env.DB_HOST,
		port: env.DB_PORT,
		database: env.DB_NAME,
		user: env.DB_USER,
		password: env.DB_PASSWORD
	}
};

export default config;
