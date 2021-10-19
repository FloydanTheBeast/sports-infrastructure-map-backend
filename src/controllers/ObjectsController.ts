import { Response } from "express";
import {
	Body,
	Get,
	JsonController,
	NotFoundError,
	Post,
	QueryParams,
	Res
} from "routing-controllers";
import { IObjectsFilters, IObjectsQueryParams } from "../interfaces";
import { getFilteredObjects, getObjectAttributes } from "../services";

@JsonController("/objects")
export default class ObjectsController {
	@Post("/")
	public async getObjects(
		@QueryParams() params: IObjectsQueryParams,
		@Body() body: IObjectsFilters,
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

		return res.status(200).send(await getFilteredObjects(params, body));
	}

	@Get("/attributes")
	public async getObjectAttributes(
		@QueryParams() params: any,
		@Res() res: Response
	): Promise<any> {
		return await getObjectAttributes(params.objectID)
			.then((obj) => res.status(200).send(obj))
			.catch((err) => {
				if (err instanceof NotFoundError) {
					return res.status(err.httpCode).send({
						message: "Объект с таким ID не найден"
					});
				}

				return res.status(400).send({
					message: "Неизвестная ошибка"
				});
			});
	}
}
