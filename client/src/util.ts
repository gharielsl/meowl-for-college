import items from "./items";

export function formatNumber(num: number): string {
    if (num < 1000) return num.toString();
    const suffixes = ['', 'k', 'm', 'b', 't', 'q', 'Qi', 'Sx'];
    const i = Math.floor(Math.log10(num) / 3);
    const suffix = suffixes[i] !== undefined ? suffixes[i] : 'e' + (i * 3);
    const formatted = (num / Math.pow(10, i * 3)).toFixed(2);
    return formatted.replace(/\.?0+$/, '') + suffix;
}

const DB_NAME = "gameDB";
const STORE_NAME = "save";

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = (e) => {
            (e.target as IDBOpenDBRequest).result.createObjectStore(STORE_NAME);
        };
        req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result);
        req.onerror = (e) => reject((e.target as IDBOpenDBRequest).error);
    });
}

function getField(db: IDBDatabase, key: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
        const req = db.transaction(STORE_NAME).objectStore(STORE_NAME).get(key);
        req.onsuccess = (e) => resolve((e.target as IDBRequest).result ?? null);
        req.onerror = (e) => reject((e.target as IDBRequest).error);
    });
}

export function saveField(key: string, value: string): Promise<void> {
    return openDB().then((db) => new Promise((resolve, reject) => {
        const req = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(value, key);
        req.onsuccess = () => resolve();
        req.onerror = (e) => reject((e.target as IDBRequest).error);
    }));
}

export async function loadData(): Promise<SaveData> {
    const db = await openDB();
    const get = (key: string) => getField(db, key);

    const [rawToyUnlocks, rawItems, rawCats, catsEaten, catsSouls, vol1, vol2, played] = await Promise.all([
        get("toyUnlocks"), get("items"), get("cats"),
        get("catsEaten"), get("catsSouls"), get("vol1"), get("vol2"), get("played"),
    ]);

    return {
        toyUnlocks: rawToyUnlocks ? JSON.parse(rawToyUnlocks) : items.filter((i) => !i.stacking).map(() => false),
        items: rawItems ? JSON.parse(rawItems) : items.filter((i) => i.stacking).map(() => 0),
        cats: rawCats ? JSON.parse(rawCats) : [],
        catsEaten: Number(catsEaten) || 0,
        catsSouls: Number(catsSouls) || 0,
        vol1: Number(vol1 ?? 50),
        vol2: Number(vol2 ?? 50),
        itemDrag: null,
        played: played === "true",
    };
}
