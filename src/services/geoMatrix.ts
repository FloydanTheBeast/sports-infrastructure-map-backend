import { IGeoRect } from "../interfaces";

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

	const resultMatrix: number[][] = [];

	for (let i = vertMinIndex; i <= vertMaxIndex; i++) {
		const row = [];
		for (let j = horzMinIndex; j <= horzMaxIndex; j++) {
			row.push(matrix[i][j]);
		}
		resultMatrix.push(row);
	}

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

export function choosePowerOfTwoMatrixSize(
	selection: IGeoRect,
	matrixGeoRect: IGeoRect,
	minMatrixSize: number,
	maxMatrixSize: number
): number {
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
