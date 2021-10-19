import { Response } from "express";
import { Get, JsonController, QueryParams, Res } from "routing-controllers";
import { IGeoRect } from "../interfaces";
import getPopulationDensityHeatMap from "../services/populationDensity";

@JsonController("/population_density_heatmap")
export default class PopulationDensityHeatmapController {
	@Get()
	public async getPopulationDensityHeatMap(
		@QueryParams() params: IGeoRect,
		@Res() res: Response
	): Promise<any> {
		if (
			!params.minLat ||
			!params.minLng ||
			!params.maxLat ||
			!params.maxLng
		) {
			return res.status(400).send({
				error: "Предоставлены некорректные параметры"
			});
		}
		return res.status(200).send(await getPopulationDensityHeatMap(params));
	}
}
