import { IObject } from ".";

export default interface IObjectExtended extends IObject {
	department_id: number | null;
	proximity_id: number;
}
