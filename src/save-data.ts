import { reactive, watch } from "vue";
import { loadData } from "./util";

// global state
const data: SaveData = reactive(loadData());

// store fields on change
watch(data, (newData) => {
    localStorage.setItem('toyUnlocks', JSON.stringify(newData.toyUnlocks));
    localStorage.setItem('items', JSON.stringify(newData.items));
    localStorage.setItem('cats', JSON.stringify(newData.cats));
    localStorage.setItem('catsEaten', String(newData.catsEaten));
    localStorage.setItem('catsSouls', String(newData.catsSouls));
    localStorage.setItem('vol1', String(newData.vol1));
    localStorage.setItem('vol2', String(newData.vol2));
    localStorage.setItem('played', newData.played);
}, { deep: true });

export default data;
