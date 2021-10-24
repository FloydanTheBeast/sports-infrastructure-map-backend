import { Response } from "express";
import {
	Get,
	HttpError,
	JsonController,
	QueryParams,
	Res
} from "routing-controllers";
import { IGeoRect } from "../interfaces";
import { getBaseStatistics } from "../services/statistics";

@JsonController("/statistics")
export default class StatisticsController {
	@Get("/")
	public async getBaseStatistics(
		@QueryParams() selection: IGeoRect,
		@Res() res: Response
	): Promise<any> {
		return await getBaseStatistics(selection)
			.then((stats) => res.status(200).send(stats))
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
