import App from "./app";

const app = new App();

app.startServer(5000, () => {
	console.log(`Server successfully started at port 5000`);
});
