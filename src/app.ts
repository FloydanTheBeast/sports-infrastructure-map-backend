import express from "express";
import {
	RoutingControllersOptions,
	useExpressServer
} from "routing-controllers";

class App {
	private server: express.Application;

	constructor(options: RoutingControllersOptions) {
		this.server = express();

		useExpressServer(this.server, { ...options });
	}

	public startServer(port: number, callback: (port: number) => void): void {
		this.server.listen(port, () => callback(port));
	}
}

export default App;
