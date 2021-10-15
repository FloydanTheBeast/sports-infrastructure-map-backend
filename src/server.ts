import "reflect-metadata";
import App from "./app";
import { ObjectsController } from "./controllers";

const app = new App({
	cors: true,
	controllers: [ObjectsController]
});

app.startServer(5000, () => {
	console.log(`Server successfully started at port 5000`);
});
