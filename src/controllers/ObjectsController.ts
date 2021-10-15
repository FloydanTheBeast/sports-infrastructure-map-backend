import { Request, Response } from "express";
import { Get, JsonController, Req, Res } from "routing-controllers";

@JsonController("/objects")
export default class ObjectsController {
	@Get()
	public async getObjects(
		@Req() req: Request,
		@Res() res: Response
	): Promise<any> {
		return res
			.status(200)
			.send({ message: "First message from the server" });
	}
}
