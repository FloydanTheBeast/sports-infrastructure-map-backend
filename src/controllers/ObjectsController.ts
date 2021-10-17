import { Response } from "express";
import { Get, JsonController, QueryParams, Res } from "routing-controllers";
import { IObjectsFilters } from "../interfaces";
import getFilteredObjects from "../services/objects";

@JsonController("/objects")
export default class ObjectsController {
	@Get()
	public async getObjects(
		@QueryParams() params: IObjectsFilters,
		@Res() res: Response
	): Promise<any> {
		if (
			!params.fromLat ||
			!params.fromLng ||
			!params.toLat ||
			!params.toLng
		) {
			return res.status(400).send({
				error: "Предоставлены некорректные параметры"
			});
		}

		return res.status(200).send(await getFilteredObjects(params));
	}
}
