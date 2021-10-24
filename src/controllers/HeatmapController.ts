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
import { IGeoRect } from "../interfaces";
import {
	getPopulationDensityHeatMap,
	getSportzoneDensityHeatMap
} from "../services";

@JsonController("/heatmap")
export default class HeatmapController {
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
				message: err.message
			});
		});
	}

	@Post("/sportzone-density")
	public async getSportzoneDensityHeatMap(
		@Body() body: { geoRect: IGeoRect; sportzoneIds: number[] },
		@Res() res: Response
	): Promise<any> {
		const { geoRect, sportzoneIds } = body;
		return await getSportzoneDensityHeatMap(geoRect, sportzoneIds).catch(
			(err) => {
				if (err instanceof HttpError) {
					return res.status(err.httpCode).send({
						message: err.message
					});
				}

				return res.status(400).send({
					message: err.message
				});
			}
		);
	}
}
