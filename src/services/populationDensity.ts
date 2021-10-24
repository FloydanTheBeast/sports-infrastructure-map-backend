import haversine from "haversine";
import _ from "lodash";
import cache from "memory-cache";
import { BadRequestError } from "routing-controllers";
import { IGeoRect, ILegendBin } from "../interfaces";
import { calculateColor, shortFormat } from "../utils";
import query from "./db";
import {
	choosePowerOfTwoMatrixSize,
	getSubMatrixForRectSelection
} from "./geoMatrix";

const MIN_MATRIX_SIZE = 128;
const MAX_MATRIX_SIZE = 2048;
const BINS_NUMBER = 5;

export async function getPopulationDensityHeatMap(
	selection: IGeoRect
): Promise<{
	geoRect: IGeoRect;
	legend: ILegendBin[];
	matrix: number[][];
}> {
	if (
		!selection.minLat ||
		!selection.minLng ||
		!selection.maxLat ||
		!selection.maxLng
	) {
		throw new BadRequestError("Предоставлены некорректные параметры");
	}

	const matrixGeoRect = await loadMatrixGeoRect();
	const matrixSize = chooseMatrixSize(selection, matrixGeoRect);
	const matrix = await loadMatrix(matrixSize);

	const subMatrix = getSubMatrixForRectSelection(
		selection,
		matrix,
		matrixGeoRect
	);

	// const maxDensityValue = _.max(_.map(subMatrix.matrix, _.max)) || 1.0;
	const maxDensityValue = 30359.132420091326;
	const binStep = maxDensityValue / BINS_NUMBER;
	const bins: ILegendBin[] = [];

	for (let i = 0; i < BINS_NUMBER; i++) {
		const minValue = i * binStep;
		const maxValue = (i + 1) * binStep;
		bins.push({
			minValue: minValue,
			maxValue: maxValue,
			minValueFormatted: shortFormat(minValue),
			maxValueFormatted: shortFormat(maxValue),
			color: calculateColor(i / (BINS_NUMBER - 1))
		});
	}

	const coloredSubMatrix = _.map(subMatrix.matrix, (row) =>
		_.map(row, (val) => calculateColor(val / maxDensityValue))
	);

	return {
		geoRect: subMatrix.geoRect,
		legend: bins,
		matrix: coloredSubMatrix
	};
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

export async function loadMatrixGeoRect(): Promise<IGeoRect> {
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
	return choosePowerOfTwoMatrixSize(
		selection,
		matrixGeoRect,
		MIN_MATRIX_SIZE,
		MAX_MATRIX_SIZE
	);
}

// Возвращает положительное вещественное число или 0
export async function getAmountOfPeopleInSelection(
	selection: IGeoRect
): Promise<number> {
	const maxMatrix = await loadMatrix(MAX_MATRIX_SIZE);
	const borders = await loadMatrixGeoRect();
	const { geoRect, matrix } = getSubMatrixForRectSelection(
		selection,
		maxMatrix,
		borders
	);
	const fullSum = _.sum(_.flatten(matrix));
	const latStepSize = (borders.maxLat - borders.minLat) / MAX_MATRIX_SIZE;
	const lngStepSize = (borders.maxLng - borders.minLng) / MAX_MATRIX_SIZE;
	const minLatCutRatio = Math.min(
		Math.max((selection.minLat - geoRect.minLat) / latStepSize, 0),
		1
	);
	const minLngCutRatio = Math.min(
		Math.max((selection.minLng - geoRect.minLng) / lngStepSize, 0),
		1
	);
	const maxLatCutRatio = Math.min(
		Math.max((geoRect.maxLat - selection.maxLat) / latStepSize, 0),
		1
	);
	const maxLngCutRatio = Math.min(
		Math.max((geoRect.maxLng - selection.maxLng) / lngStepSize, 0),
		1
	);
	const minLatEdgeSum = _.sum(_.first(matrix)) * minLatCutRatio;
	const minLngEdgeSum = _.sum(_.map(matrix, _.first)) * minLngCutRatio;
	const maxLatEdgeSum = _.sum(_.last(matrix)) * maxLatCutRatio;
	const maxLngEdgeSum = _.sum(_.map(matrix, _.last)) * maxLngCutRatio;

	const minLatMinLngCorner =
		(_.first(_.first(matrix) || []) || 0) * minLatCutRatio * minLngCutRatio;
	const minLatMaxLngCorner =
		(_.last(_.first(matrix) || []) || 0) * minLatCutRatio * maxLngCutRatio;
	const maxLatMinLngCorner =
		(_.first(_.last(matrix) || []) || 0) * maxLatCutRatio * minLngCutRatio;
	const maxLatMaxLngCorner =
		(_.last(_.last(matrix) || []) || 0) * maxLatCutRatio * maxLngCutRatio;

	const selectionMatrixSum =
		fullSum -
		(minLatEdgeSum + minLngEdgeSum + maxLatEdgeSum + maxLngEdgeSum) -
		(minLatMinLngCorner +
			minLatMaxLngCorner +
			maxLatMinLngCorner +
			maxLatMaxLngCorner);

	const startLat = {
		latitude: borders.minLat,
		longitude: (borders.minLng + borders.maxLng) / 2
	};
	const endLat = {
		latitude: borders.maxLat,
		longitude: (borders.minLng + borders.maxLng) / 2
	};
	const startLng = {
		latitude: (borders.minLat + borders.maxLat) / 2,
		longitude: borders.minLng
	};
	const endLng = {
		latitude: (borders.minLat + borders.maxLat) / 2,
		longitude: borders.maxLng
	};
	const mapLatHeight = borders.maxLat - borders.minLat;
	const mapLngWidth = borders.maxLng - borders.minLng;
	const mapHeightKm =
		haversine(startLat, endLat, { unit: "km" }) / mapLatHeight;
	const mapWidthKm =
		haversine(startLng, endLng, { unit: "km" }) / mapLngWidth;

	const oneCellSquare =
		(mapHeightKm / MAX_MATRIX_SIZE) * (mapWidthKm / MAX_MATRIX_SIZE);

	return selectionMatrixSum * oneCellSquare;
}
