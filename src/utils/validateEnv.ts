import { cleanEnv, port } from "envalid";
import { IEnvVars } from "../interfaces";

export function validateEnv(env: unknown): IEnvVars {
	return cleanEnv(env, {
		SERVER_PORT: port({ desc: "Порт веб-сервера", default: 5000 })
	});
}
