import { Response } from "express";
import { Pool } from "pg";
import { Get, JsonController, Res } from "routing-controllers";
import config from "../config";

@JsonController("/objects")
export default class ObjectsController {
	private pool: Pool;

	constructor() {
		this.pool = new Pool({
			host: config.db.host,
			port: config.db.port,
			database: config.db.name,
			user: config.db.user,
			password: config.db.password
		});
	}

	@Get()
	public async getObjects(@Res() res: Response): Promise<any> {
		return this.pool
			.query("SELECT * FROM objects LIMIT 30")
			.then((dbResult) => res.status(200).send(dbResult.rows));
	}
}
