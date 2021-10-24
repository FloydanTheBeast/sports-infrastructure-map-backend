import { calculateColor } from ".";

export const calculateProximityColor = (
	minSuare: number,
	maxSquare: number,
	objectSquare: number
): number => {
	let percent = 1;

	if (maxSquare !== minSuare) {
		percent = (objectSquare - minSuare) / (maxSquare - minSuare);
	}

	return calculateColor(percent);
};
