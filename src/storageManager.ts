import { Engine } from "./engine";

export class StorageManager {
    constructor() {
    };
    saveData<T>(key: string, data: T): void {
        localStorage.setItem(key, JSON.stringify(data));
    };
    getData<T>(key: string, defaultData: T): T {
        const raw = localStorage.getItem(key);
        if (raw === null) {
            this.saveData(key, defaultData);
            return defaultData;
        };
        try {
            return JSON.parse(raw) as T;
        } catch (e) {
            console.warn(`Failed to parse data for key "${key}", using default.`, e);
            this.saveData(key, defaultData); // overwrite corrupted value
            return defaultData;
        };
    };
    removeData(key: string): void {
        localStorage.removeItem(key);
    };
    removeAllData(): void {
        localStorage.clear();
    };

};