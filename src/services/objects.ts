import { IObject, IObjectsFilters } from "../interfaces";
import query from "./db";

async function getFilteredObjects(
	filters: IObjectsFilters
): Promise<IObject[]> {
	const objects = await query(
		`SELECT id, name, lat, lng, address FROM objects
			 WHERE lat <= $1 AND lng >= $2 AND lat >= $3 AND lng <= $4`,
		[filters.fromLat, filters.fromLng, filters.toLat, filters.toLng]
	);

	return objects;
}

export default getFilteredObjects;
