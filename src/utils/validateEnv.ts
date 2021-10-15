import { cleanEnv, host, port, str } from "envalid";
import { IEnvVars } from "../interfaces";

export function validateEnv(env: unknown): IEnvVars {
	return cleanEnv(env, {
		SERVER_PORT: port({ desc: "Порт веб-сервера", default: 5000 }),
		DB_HOST: host({ desc: "Хост базы данных", default: "0.0.0.0" }),
		DB_PORT: port({ desc: "Порт базы данных", default: 5001 }),
		DB_NAME: str({ desc: "Название базы данных", default: "database" }),
		DB_USER: str({ desc: "Пользователь базы данных", default: "admin" }),
		DB_PASSWORD: str({ desc: "Пароль базы данных", default: "password" })
	});
}
