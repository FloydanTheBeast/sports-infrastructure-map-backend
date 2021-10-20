import { Response } from "express";
import {
	Body,
	Get,
	HttpError,
	JsonController,
	Post,
	QueryParams,
	Res
} from "routing-controllers";
import { IObject, IObjectsFilters, IObjectsQueryParams } from "../interfaces";
import { getFilteredObjects, getObjectAttributes } from "../services";

@JsonController("/objects")
export default class ObjectsController {
	@Post("/")
	public async getObjects(
		@QueryParams() params: IObjectsQueryParams,
		@Body() body: IObjectsFilters,
		@Res() res: Response
	): Promise<IObject[] | Record<any, any>> {
		return await getFilteredObjects(params, body)
			.then((objs) => res.status(200).send(objs))
			.catch((err) => {
				if (err instanceof HttpError) {
					return res.status(err.httpCode).send({
						message: err.message
					});
				}

				return res.status(400).send({
					message: err.message
				});
			});
	}

	@Get("/attributes")
	public async getObjectAttributes(
		@QueryParams() params: any,
		@Res() res: Response
	): Promise<any> {
		return await getObjectAttributes(params.objectID)
			.then((obj) => res.status(200).send(obj))
			.catch((err) => {
				if (err instanceof HttpError) {
					return res.status(err.httpCode).send({
						message: err.message
					});
				}

				return res.status(400).send({
					message: err.message
				});
			});
	}
}
