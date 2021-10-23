import _ from "lodash";
import { BadRequestError, NotFoundError } from "routing-controllers";
import { IObject, IObjectsFilters, IObjectsQueryParams } from "../interfaces";
import query from "./db";

export async function getFilteredObjects(
	params: IObjectsQueryParams,
	filters: IObjectsFilters
): Promise<IObject[]> {
	if (
		!(
			Number.isFinite(+params.fromLat) &&
			Number.isFinite(+params.fromLng) &&
			Number.isFinite(+params.toLat) &&
			Number.isFinite(+params.toLng)
		)
	) {
		throw new BadRequestError(
			"Должны быть указаны 4 параметра для обозначения области"
		);
	}

	const objects = await query(
		`
			SELECT DISTINCT obj.id, obj.name, obj.lat, obj.lng, obj.address FROM objects obj
				JOIN sportzones sz ON sz.object_id = obj.id
				JOIN sportzone_types szt ON szt.id = sz.sportzone_type_id
				JOIN sportzone_sport_types szst ON szst.sportzone_id = sz.id
					WHERE (obj.lat >= $1 AND obj.lng >= $2 AND obj.lat <= $3 AND obj.lng <= $4)
						AND (($5 = '') IS NOT FALSE OR lower(obj.name) LIKE $5)
						AND (array_length($6::int[], 1) IS NULL OR obj.department_id = ANY($6::int[]))
						AND (($7 = '') IS NOT FALSE OR lower(sz.name) LIKE $7)
						AND (array_length($8::int[], 1) IS NULL OR szt.id = ANY($8::int[]))
						AND (array_length($9::int[], 1) IS NULL OR szst.sport_type_id = ANY($9::int[]))
						AND (array_length($10::int[], 1) IS NULL OR obj.proximity_id = ANY($10::int[]))
		`,
		[
			params.fromLat,
			params.fromLng,
			params.toLat,
			params.toLng,
			filters?.objectName ? `%${filters.objectName.toLowerCase()}%` : "",
			filters?.departmentIds || [],
			filters?.sportzoneName
				? `%${filters.sportzoneName.toLowerCase()}%`
				: "",
			filters?.sportzoneTypesIds || [],
			filters?.sportTypesIds || [],
			filters?.proximityIds || []
		]
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
		throw new NotFoundError("Объект с заданным ID не был найден");
	}

	const sportzones = await query(
		`
			SELECT s.name, s.square, json_agg(st.name) as sportsTypes FROM sportzones s
				JOIN sportzone_sport_types sst ON sst.sportzone_id = s.id
				JOIN sport_types st ON st.id = sst.sport_type_id
				WHERE object_id = $1
				GROUP BY s.id
	`,
		[objectID]
	);

	return { ...objectAttributes, sportzones };
}

export async function getObjectFilters(): Promise<any> {
	const departments = await query(`
		SELECT * FROM departments
	`);

	const sportzoneTypes = await query(`
		SELECT * FROM sportzone_types
	`);

	const sportsTypes = await query(`
		SELECT * FROM sport_types
	`);

	let proximities = await query(`
		SELECT * FROM proximity
	`);

	proximities = _.map(proximities, (proximity) => {
		return {
			id: proximity.id,
			name: `${proximity.proximity} - до ${proximity.radius} м.`
		};
	});

	return {
		departments,
		sportzoneTypes,
		sportsTypes,
		proximities
	};
}
