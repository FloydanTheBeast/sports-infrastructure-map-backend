import "reflect-metadata";
import App from "./app";
import config from "./config";
import {
	ObjectsController,
	PopulationDensityHeatmapController
} from "./controllers";

const app = new App({
	cors: true,
	controllers: [ObjectsController, PopulationDensityHeatmapController]
});

app.startServer(config.server.port, (port) => {
	console.log(`Server successfully started on port ${port}`);
});
