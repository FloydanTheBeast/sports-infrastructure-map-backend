import { Response } from "express";
import {
	Get,
	HttpError,
	JsonController,
	QueryParams,
	Res
} from "routing-controllers";
import { IGeoRect } from "../interfaces";
import getPopulationDensityHeatMap from "../services/populationDensity";

@JsonController("/heatmap")
export default class PopulationDensityHeatmapController {
	@Get("/population-density")
	public async getPopulationDensityHeatMap(
		@QueryParams() params: IGeoRect,
		@Res() res: Response
	): Promise<any> {
		return await getPopulationDensityHeatMap(params).catch((err) => {
			if (err instanceof HttpError) {
				return res.status(err.httpCode).send({
					message: err.message
				});
			}

			return res.status(400).send({
				message: err.message()
			});
		});
	}
}
