import { HIGH_DENSITY_COLOR, LOW_DENSITY_COLOR } from "./colorConsts";

const getColorChannelsValues = (hexColor: string): [number, number, number] => {
	return [
		parseInt(hexColor.slice(0, 2), 16),
		parseInt(hexColor.slice(2, 4), 16),
		parseInt(hexColor.slice(4, 6), 16)
	];
};

export const calculateColor = (percent: number): number => {
	if (percent < 0 || percent > 1) {
		throw new RangeError("Процент должен быть значение от 0 до 1");
	}

	const LOW_DENSITY_COLOR_CHANNELS =
		getColorChannelsValues(LOW_DENSITY_COLOR);
	const HIGH_DENSITY_COLOR_CHANNELS =
		getColorChannelsValues(HIGH_DENSITY_COLOR);

	let colorString = "";

	for (let i = 0; i < 3; i++) {
		colorString += (
			LOW_DENSITY_COLOR_CHANNELS[i] +
			Math.round(
				(HIGH_DENSITY_COLOR_CHANNELS[i] -
					LOW_DENSITY_COLOR_CHANNELS[i]) *
					percent
			)
		)
			.toString(16)
			.padStart(2, "0");
	}

	return parseInt(colorString, 16);
};
