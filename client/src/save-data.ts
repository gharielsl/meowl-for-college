import { reactive, watch } from "vue";
import { loadData, saveField } from "./util";

export const saveData = reactive<SaveData>({} as SaveData);

export async function initStore() {
    const saved = await loadData();
    Object.assign(saveData, saved);
    watch(saveData, async (newData) => {
        await Promise.all([
            saveField("toyUnlocks", JSON.stringify(newData.toyUnlocks)),
            saveField("items", JSON.stringify(newData.items)),
            saveField("cats", JSON.stringify(newData.cats)),
            saveField("catsEaten", String(newData.catsEaten)),
            saveField("catsSouls", String(newData.catsSouls)),
            saveField("vol1", String(newData.vol1)),
            saveField("vol2", String(newData.vol2)),
            saveField("played", String(newData.played)),
        ]);
    }, { deep: true });
}