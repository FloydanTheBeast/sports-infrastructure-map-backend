import _ from "lodash";
import query from "./db";
import { BadRequestError } from "routing-controllers";
import { IGeoRect, ILegendBin } from "../interfaces";
import { calculateColor } from "../utils";
import { choosePowerOfTwoMatrixSize, getCoveredIndex } from "./geoMatrix";
import { loadMatrixGeoRect } from "./populationDensity";

const MIN_MATRIX_SIZE = 32;
const MAX_MATRIX_SIZE = 2048;
const BINS_NUMBER = 5;

export async function getSportzoneDensityHeatMap(
	selection: IGeoRect,
	sportzoneIds: number[]
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

	const matrixSize = choosePowerOfTwoMatrixSize(
		selection,
		matrixGeoRect,
		MIN_MATRIX_SIZE,
		MAX_MATRIX_SIZE
	);

	const vertMinIndex = Math.min(
		Math.max(
			getCoveredIndex(
				selection.minLat,
				matrixGeoRect.minLat,
				matrixGeoRect.maxLat,
				matrixSize
			),
			0
		),
		matrixSize - 1
	);

	const horzMinIndex = Math.min(
		Math.max(
			getCoveredIndex(
				selection.minLng,
				matrixGeoRect.minLng,
				matrixGeoRect.maxLng,
				matrixSize
			),
			0
		),
		matrixSize - 1
	);

	const vertMaxIndex = Math.min(
		Math.max(
			getCoveredIndex(
				selection.maxLat,
				matrixGeoRect.minLat,
				matrixGeoRect.maxLat,
				matrixSize
			),
			0
		),
		matrixSize - 1
	);

	const horzMaxIndex = Math.min(
		Math.max(
			getCoveredIndex(
				selection.maxLng,
				matrixGeoRect.minLng,
				matrixGeoRect.maxLng,
				matrixSize
			),
			0
		),
		matrixSize - 1
	);

	const vertStep = (matrixGeoRect.maxLat - matrixGeoRect.minLat) / matrixSize;
	const horzStep = (matrixGeoRect.maxLng - matrixGeoRect.minLng) / matrixSize;

	const resultBorders: IGeoRect = {
		minLat: matrixGeoRect.minLat + vertMinIndex * vertStep,
		minLng: matrixGeoRect.minLng + horzMinIndex * horzStep,
		maxLat: matrixGeoRect.minLat + (vertMaxIndex + 1) * vertStep,
		maxLng: matrixGeoRect.minLng + (horzMaxIndex + 1) * horzStep
	};

	const resultHeight = vertMaxIndex - vertMinIndex + 1;
	const resultWidth = horzMaxIndex - horzMinIndex + 1;

	const parts = await query(
		`
		SELECT vert_index, horz_index, height, width, matrix
		FROM sportzone_density_matrixes
		WHERE vert_index + height - 1 >= $1
			AND vert_index - height + 1 <= $2
			AND horz_index + width - 1 >= $3
			AND horz_index - width + 1 <= $4
			AND sportzone_id = ANY($5::int[])
	`,
		[vertMinIndex, vertMaxIndex, horzMinIndex, horzMaxIndex, sportzoneIds]
	);

	const resultMatrix = _.times(resultHeight, () =>
		_.times(resultWidth, () => 0)
	);
	_.forEach(parts, (part) => {
		const vertIndex = part["vert_index"];
		const horzIndex = part["horz_index"];
		const height = part["height"];
		const width = part["width"];
		const matrix = JSON.parse(part["matrix"]);

		const copyVertMinIndex = Math.max(vertMinIndex, vertIndex);
		const copyVertMaxIndex = Math.min(vertMaxIndex, vertIndex + height - 1);
		const copyHorzMinIndex = Math.max(horzMinIndex, horzIndex);
		const copyHorzMaxIndex = Math.min(horzMaxIndex, horzIndex + width - 1);

		for (let i = copyVertMinIndex; i <= copyVertMaxIndex; i++) {
			for (let j = copyHorzMinIndex; j <= copyHorzMaxIndex; j++) {
				resultMatrix[i - vertMinIndex][j - horzMinIndex] +=
					matrix[i - vertIndex][j - horzIndex];
			}
		}
	});

	const maxDensityValue = _.max(_.map(resultMatrix, _.max)) || 10.0;
	const binStep = maxDensityValue / BINS_NUMBER;
	const bins: ILegendBin[] = [];

	for (let i = 0; i < BINS_NUMBER; i++) {
		bins.push({
			minValue: i * binStep,
			maxValue: (i + 1) * binStep,
			color: calculateColor(i / (BINS_NUMBER - 1))
		});
	}

	const coloredMatrix = _.map(resultMatrix, (row) =>
		_.map(row, (val) => calculateColor(val / maxDensityValue))
	);

	return {
		geoRect: resultBorders,
		legend: bins,
		matrix: coloredMatrix
	};
}
