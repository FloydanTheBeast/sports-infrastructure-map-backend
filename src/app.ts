import express from "express";

class App {
	private server: express.Application;

	constructor() {
		this.server = express();
	}

	public startServer(port: number, callback?: () => void): void {
		this.server.listen(port, callback);
	}
}

export default App;
