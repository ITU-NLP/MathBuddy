import {PersistInMemStorage} from "./storage/persistInMemStorage.ts";

const START_TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');
const STORAGE_PATH: string = `./memory/${START_TIMESTAMP}_run.json`;

export const storage = new PersistInMemStorage(STORAGE_PATH);