import express from "express";
import path from "path";
import {
	RoutingControllersOptions,
	useExpressServer
} from "routing-controllers";
import swaggerUI from "swagger-ui-express";
import YAML from "yamljs";

const swaggerDoc = YAML.load(path.join(__dirname, "openapi.yml"));

class App {
	private server: express.Application;

	constructor(options: RoutingControllersOptions) {
		this.server = express();
		this.server.use(
			"/api-docs",
			swaggerUI.serve,
			swaggerUI.setup(swaggerDoc)
		);

		useExpressServer(this.server, { ...options });
	}

	public startServer(port: number, callback: (port: number) => void): void {
		this.server.listen(port, () => callback(port));
	}
}

export default App;
