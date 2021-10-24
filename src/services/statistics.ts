import { BadRequestError } from "routing-controllers";
import { IGeoRect } from "../interfaces";
import query from "./db";

export async function getBaseStatistics(selection: IGeoRect): Promise<any> {
	if (
		!selection.minLat ||
		!selection.minLng ||
		!selection.maxLat ||
		!selection.maxLng
	) {
		throw new BadRequestError("Предоставлены некорректные параметры");
	}

	// Население, для которого считаются показатели
	const POPULATION_INDEX = 100000;

	const stats = await query(
		`
		SELECT (count(s.id)::float / $1) as sportzones_count, (sum(s.square) / $1) as square, (sum(ss.sports_count)::float / $1) as sports_count FROM objects obj
		JOIN sportzones s on obj.id = s.object_id
		JOIN (
			SELECT sportzone_id, count(sport_type_id) as sports_count FROM sportzone_sport_types ssp
			GROUP BY sportzone_id
		) as ss ON ss.sportzone_id = s.id
		WHERE obj.lat >= $2 AND obj.lng >= $3 AND obj.lat <= $4 AND obj.lng <= $5;
	`,
		[
			POPULATION_INDEX,
			selection.minLat,
			selection.minLng,
			selection.maxLat,
			selection.maxLng
		]
	);

	if (stats.length !== 1) {
		throw new Error("Непредвиденная ошибка");
	}
	return stats[0];
}
