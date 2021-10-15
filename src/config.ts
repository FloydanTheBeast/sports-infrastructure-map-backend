import dontenv from "dotenv";
import path from "path";
import { validateEnv } from "./utils";

dontenv.config({ path: path.join(__dirname, ".env") });

const env = validateEnv(process.env);

const config = {
	server: {
		port: env.SERVER_PORT
	}
};

export default config;
