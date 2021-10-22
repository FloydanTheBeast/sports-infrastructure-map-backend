import { IGeoRect } from "../interfaces";
import { calculateColor } from "../utils";

export function getSubMatrixForRectSelection(
	selection: IGeoRect,
	matrix: number[][],
	matrixGeoRect: IGeoRect
): { geoRect: IGeoRect; matrix: number[][] } {
	if (
		selection.minLat > selection.maxLat ||
		selection.minLng > selection.maxLng
	) {
		throw new Error(
			"Selection must be sorted minLat < maxLat, minLng < maxLng"
		);
	}

	const vertN = matrix.length;
	const horzN = matrix[0].length;
	const vertStep = (matrixGeoRect.maxLat - matrixGeoRect.minLat) / vertN;
	const horzStep = (matrixGeoRect.maxLng - matrixGeoRect.minLng) / horzN;

	const vertMinIndex = Math.min(
		Math.max(
			getCoveredIndex(
				selection.minLat,
				matrixGeoRect.minLat,
				matrixGeoRect.maxLat,
				vertN
			),
			0
		),
		vertN - 1
	);

	const horzMinIndex = Math.min(
		Math.max(
			getCoveredIndex(
				selection.minLng,
				matrixGeoRect.minLng,
				matrixGeoRect.maxLng,
				horzN
			),
			0
		),
		horzN - 1
	);

	const vertMaxIndex = Math.min(
		Math.max(
			getCoveredIndex(
				selection.maxLat,
				matrixGeoRect.minLat,
				matrixGeoRect.maxLat,
				vertN
			),
			0
		),
		vertN - 1
	);

	const horzMaxIndex = Math.min(
		Math.max(
			getCoveredIndex(
				selection.maxLng,
				matrixGeoRect.minLng,
				matrixGeoRect.maxLng,
				horzN
			),
			0
		),
		horzN - 1
	);
	const resultBorders: IGeoRect = {
		minLat: matrixGeoRect.minLat + vertMinIndex * vertStep,
		minLng: matrixGeoRect.minLng + horzMinIndex * horzStep,
		maxLat: matrixGeoRect.minLat + (vertMaxIndex + 1) * vertStep,
		maxLng: matrixGeoRect.minLng + (horzMaxIndex + 1) * horzStep
	};

	let resultMatrix: number[][] = [];

	let maxDensityValue = 0;

	for (let i = vertMinIndex; i <= vertMaxIndex; i++) {
		const row = [];
		for (let j = horzMinIndex; j <= horzMaxIndex; j++) {
			maxDensityValue = Math.max(maxDensityValue, matrix[i][j]);
			row.push(matrix[i][j]);
		}
		resultMatrix.push(row);
	}

	resultMatrix = resultMatrix.map((row) =>
		row.map((val) => calculateColor(val / maxDensityValue))
	);

	return {
		geoRect: resultBorders,
		matrix: resultMatrix
	};
}

function getCoveredIndex(
	x: number,
	left: number,
	right: number,
	steps: number
): number {
	const length = right - left;
	const shift = x - left;
	const relativePosition = shift / length;

	return Math.floor(relativePosition * steps);
}
