import { Pool } from "pg";
import config from "../config";

const pool = new Pool(config.db);

async function query(query: string, params: unknown[]): Promise<any[]> {
	const { rows } = await pool.query(query, params);

	return rows;
}

export default query;
