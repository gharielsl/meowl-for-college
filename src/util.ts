import items from "./items";

export function formatNumber(num: number): string {
    if (num < 1000) return num.toString();
    const suffixes = ['', 'k', 'm', 'b', 't', 'q', 'Qi', 'Sx'];
    const i = Math.floor(Math.log10(num) / 3);
    const suffix = suffixes[i] !== undefined ? suffixes[i] : 'e' + (i * 3);
    const formatted = (num / Math.pow(10, i * 3)).toFixed(2);
    return formatted.replace(/\.?0+$/, '') + suffix;
}

// load or create default data
export function loadData() {
    // json fields
    let loadToyUnlocks: any = localStorage.getItem('toyUnlocks');
    let loadItems: any = localStorage.getItem('items');
    let loadCats: any = localStorage.getItem('cats');
    if (loadToyUnlocks) loadToyUnlocks = JSON.parse(loadToyUnlocks);
    if (loadItems) loadItems = JSON.parse(loadItems);
    if (loadCats) loadCats = JSON.parse(loadCats);

    const loadPlayed = localStorage.getItem('played');

    const data: SaveData = {
        toyUnlocks: loadToyUnlocks || items.filter((item) => !item.stacking).map(() => false),
        items: loadItems || items.filter((item) => item.stacking).map(() => 0),
        cats: loadCats || [],
        catsEaten: Number(localStorage.getItem('catsEaten')) || 0,
        catsSouls: Number(localStorage.getItem('catsSouls')) || 0,
        vol1: Number(localStorage.getItem('vol1') || 50),
        vol2: Number(localStorage.getItem('vol2') || 50),
        itemDrag: null,
        played: loadPlayed === 'true'
    };

    return data;
}

