export default interface IObject {
	id: number;
	name: string;
	department_id: number | null;
	proximity_id: number;
	lat: number;
	lng: number;
	address: string;
}
