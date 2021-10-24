import numeral from "numeral";

export function shortFormat(num: number): string {
	if (num < 0) {
		return "-" + shortFormat(-num);
	}

	if (num < 1000 && isInteger(num)) {
		return numeral(num).format("0");
	}
	if (num < 1) {
		return numeral(num).format("0.000");
	}
	if (num < 10) {
		return numeral(num).format("0.00");
	}
	if (num < 100) {
		return numeral(num).format("0.0");
	}
	if (num < 1000) {
		return numeral(num).format("0");
	}
	if (num < 10000) {
		return numeral(num / 1000).format("0.00") + "K";
	}
	if (num < 100000) {
		return numeral(num / 1000).format("0.0") + "K";
	}
	if (num < 1000000) {
		return numeral(num / 1000).format("0") + "K";
	}
	if (num < 10000000) {
		return numeral(num / 1000000).format("0.00") + "M";
	}
	if (num < 100000000) {
		return numeral(num / 1000000).format("0.0") + "M";
	}

	return numeral(num / 1000000).format("0") + "M";
}

function isInteger(num: number): boolean {
	return Math.round(num) == num;
}
