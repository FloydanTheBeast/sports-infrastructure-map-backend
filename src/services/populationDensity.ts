import { getSubMatrixForRectSelection } from "./geoMatrix";
import { IGeoRect } from "../interfaces";
import query from "./db";
import cache from "memory-cache";

async function getPopulationDensityHeatMap(selection: IGeoRect): Promise<{
	geoRect: IGeoRect;
	matrix: number[][];
}> {
	const matrixGeoRect = await loadMatrixGeoRect();
	const matrixSize = chooseMatrixSize(selection, matrixGeoRect);
	const matrix = await loadMatrix(matrixSize);
	return getSubMatrixForRectSelection(selection, matrix, matrixGeoRect);
}

async function loadMatrix(size: number): Promise<number[][]> {
	const cacheKey = `population-density-matrix-${size}`;
	if (cache.get(cacheKey) === null) {
		const records = await query(
			`SELECT size, matrix
			FROM population_density_matrixes
			WHERE size = $1`,
			[size]
		);
		const matrix = JSON.parse(records[0]["matrix"]);
		cache.put(cacheKey, matrix);
	}
	return cache.get(cacheKey);
}

async function loadMatrixGeoRect(): Promise<IGeoRect> {
	const cacheKey = "matrix-geo-rect";
	if (cache.get(cacheKey) === null) {
		const records = await query(
			`SELECT min_lat, min_lng, max_lat, max_lng
			FROM map_borders`,
			[]
		);
		const borders = records[0];
		const geoRect = {
			minLat: borders["min_lat"],
			minLng: borders["min_lng"],
			maxLat: borders["max_lat"],
			maxLng: borders["max_lng"]
		};
		cache.put(cacheKey, geoRect);
	}
	return cache.get(cacheKey);
}

function chooseMatrixSize(
	selection: IGeoRect,
	matrixGeoRect: IGeoRect
): number {
	const minMatrixSize = 32;
	const maxMatrixSize = 2048;

	const latZoom =
		(matrixGeoRect.maxLat - matrixGeoRect.minLat) /
		(selection.maxLat - selection.minLat);
	const lngZoom =
		(matrixGeoRect.maxLng - matrixGeoRect.minLng) /
		(selection.maxLng - selection.minLng);
	const zoom = Math.max(latZoom, lngZoom) * minMatrixSize;
	const powerOf2 = Math.floor(Math.log2(zoom) + 0.5);
	const matrixSize = Math.round(Math.pow(2, powerOf2));

	return Math.max(Math.min(matrixSize, maxMatrixSize), minMatrixSize);
}

export default getPopulationDensityHeatMap;
