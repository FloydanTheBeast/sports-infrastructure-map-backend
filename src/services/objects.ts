import { NotFoundError } from "routing-controllers";
import { IObject, IObjectsFilters } from "../interfaces";
import query from "./db";

export async function getFilteredObjects(
	filters: IObjectsFilters
): Promise<IObject[]> {
	const objects = await query(
		`SELECT id, name, lat, lng, address FROM objects
			 WHERE lat <= $1 AND lng >= $2 AND lat >= $3 AND lng <= $4`,
		[filters.fromLat, filters.fromLng, filters.toLat, filters.toLng]
	);

	return objects;
}

export async function getObjectAttributes(objectID: number): Promise<any> {
	const objectAttributes = await query(
		`
		SELECT o.name, address, d.name as department, p.proximity FROM objects o
		LEFT JOIN departments d ON o.department_id = d.id
		JOIN proximity p ON o.proximity_id = p.id
		WHERE o.id = $1;
	`,
		[objectID]
	).then((res) => res[0]);

	if (!objectAttributes) {
		throw new NotFoundError();
	}

	const sportzones = await query(
		`
		SELECT s.name, s.square, json_agg(st.name) as sports_types FROM sportzones s
			JOIN sportzone_sport_types sst ON sst.sportzone_id = s.id
			JOIN sport_types st ON st.id = sst.sport_type_id
			WHERE object_id = $1
			GROUP BY s.id
	`,
		[objectID]
	);

	return { ...objectAttributes, sportzones };
}
