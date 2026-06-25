interface ChatMessage {
    id: number;
    sender: 'user' | 'cat';
    text: string;
    happiness?: number;
    loveDelta?: number;
}

interface Cat {
    id: number;
    name: string;
    color: string;
    love: number;
    template: CatTemplate;
    messages?: ChatMessage[];
}

interface CatTemplate {
    image: string;
    eyes: [number, number]; // top left position in pixels
}

interface Item {
    name: string;
    img: string;
    stacking: boolean; // if false, item is unlockable toy
    saveDataIndex: number;
    // when item is used on cat will call this function and assign return value to cat.love
    loveTransform: (love: number) => number;
}

interface ItemDrag {
    item: Item;
}

interface SaveData {
    // unlock status of item for corresponding index in items.ts
    toyUnlocks: boolean[],
    catsEaten: number,
    catsSouls: number,
    // count of item for corresponding index in items.ts
    items: number[],
    vol1: number, // background music
    vol2: number, // everything else
    cats: Cat[],
    itemDrag: ItemDrag | null, // itemDrag is not actually stored its just a state
    played: any // if undefined or false, reset game button will not show
};