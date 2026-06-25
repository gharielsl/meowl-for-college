import { saveData } from "./save-data";

const items: Item[] = [
    // stacking items
    {
        name: 'Dry Food',
        img: './item_dry_food.png',
        stacking: true,
        saveDataIndex: 0,
        loveTransform: (love: number) => love + 3 + Math.floor(love * 0.01 * 1.1)
    },
    {
        name: 'Cookie',
        img: './item_cookie.png',
        stacking: true,
        saveDataIndex: 1,
        loveTransform: (love: number) => love + 15 + Math.floor(love * 0.025 * 1.6)
    },
    {
        name: 'Wet Food',
        img: './item_wet_food.png',
        stacking: true,
        saveDataIndex: 2,
        loveTransform: (love: number) => love + 50 + Math.floor(love * 0.05 * 1.8)
    },
    {
        name: 'Fish',
        img: './item_fish.png',
        stacking: true,
        saveDataIndex: 3,
        loveTransform: (love: number) => love + 500 + Math.floor(love * 0.08 * 2)
    },

    // unlockable items
    {
        name: 'Rod',
        img: './item_rod.png',
        stacking: false,
        saveDataIndex: 0,
        loveTransform: (love: number) => love + 2500 + Math.floor(love * 0.12)
    },
    {
        name: 'Yarn',
        img: './item_yarn.png',
        stacking: false,
        saveDataIndex: 1,
        loveTransform: (love: number) => love + 8000 + Math.floor(love * 0.18)
    },
    {
        name: 'Mouse Toy',
        img: './item_mouse.png',
        stacking: false,
        saveDataIndex: 2,
        loveTransform: (love: number) => love + 35000 + Math.floor(love * 0.25) + (saveData.catsEaten * 50)
    },
    {
        name: 'Laser Pointer',
        img: './item_laser.png',
        stacking: false,
        saveDataIndex: 3,
        loveTransform: (love: number) => love + 1000000 + Math.floor(love * 0.40) + (saveData.catsEaten * 2500)
    }
];

export default items;
