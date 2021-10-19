import { getSubMatrixForRectSelection } from "./geoMatrix";
import { IGeoRect } from "../interfaces";
import query from "./db";
import cache from "memory-cache";

const matrixGeoRect = {
	minLat: 55.1471993,
	minLng: 36.75571401,
	maxLat: 56.0785417,
	maxLng: 38.06930099
};

async function getPopulationDensityHeatMap(selection: IGeoRect): Promise<{
	geoRect: IGeoRect;
	matrix: number[][];
}> {
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
