<script setup lang="ts">
import saveData from './save-data';
import items from './items';
import { formatNumber } from './util';

const props = defineProps<{
    onClose?: () => void;
    onPurrchase?: () => void;
}>();

const itemsFood = [
    {
        item: items[0] as Item,
        cost: 1
    },
    {
        item: items[1] as Item,
        cost: 32
    },
    {
        item: items[2] as Item,
        cost: 91
    },
    {
        item: items[3] as Item,
        cost: 1200
    }
];

const itemsToy = [
    {
        item: items[4] as Item,
        cost: 42000
    },
    {
        item: items[5] as Item,
        cost: 120000
    },
    {
        item: items[6] as Item,
        cost: 5100000
    },
    {
        item: items[7] as Item,
        cost: 3260000000
    }
];

function buy(shopItem: { item: Item, cost: number }) {
    if (shopItem.cost > saveData.catsSouls) return;
    const index = shopItem.item.saveDataIndex;
    if (index === -1) return;
    if (shopItem.item.stacking) {
        if (saveData.items[index] === undefined) return;
        saveData.items[index]++; // inc count
    } else {
        if (saveData.toyUnlocks[index] === undefined) return;
        saveData.toyUnlocks[index] = true; // unlock item
    }
    saveData.catsSouls -= shopItem.cost; // pay the price
    props.onPurrchase?.();
}
</script>

<template>
    <div @click="(e) => e.stopPropagation()" class="shop">
        <button @click="onClose" class="btn-exit" aria-label="Close">x</button>
        <div style="display: flex; width: 100%; justify-content: space-between;">
            <span class="lbl-colorful">Shop</span>
            <span class="lbl-colorful"><img draggable="false" class="souls-contained" src="/cat_soul.png"> x {{
                formatNumber(saveData.catsSouls)
                }}</span>
        </div>
        <div class="lbl-shop-category"><span>Food</span></div>
        <div class="shop-item-row">
            <div @click="() => buy(item)" :class="{ 'shop-item': true, 'disabled': saveData.catsSouls < item.cost }"
                v-for="item in itemsFood">
                <img draggable="false" :src="item.item.img">
                <span class="lbl-cost"><img draggable="false" class="cost" src="/cat_soul.png"> x {{ formatNumber(item.cost) }}</span>
            </div>
        </div>
        <div class="lbl-shop-category"><span>Toys</span></div>
        <div class="shop-item-row">
            <div @click="() => buy(item)"
                :class="{ 'shop-item': true, 'disabled': saveData.catsSouls < item.cost || saveData.toyUnlocks[item.item.saveDataIndex] }"
                v-for="item in itemsToy">
                <img draggable="false" :src="item.item.img">
                <span class="lbl-cost"><img draggable="false" class="cost" src="/cat_soul.png"> x {{ formatNumber(item.cost) }}</span>
                <span class="lbl-unlocked" v-if="saveData.toyUnlocks[item.item.saveDataIndex]">Unlocked</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.lbl-unlocked {
    position: absolute;
    top: 50%;
    left: 50%;
    color: #fbf236;
    font-size: 30px;
    transform: translate(-50%, -50%) rotate(-23deg);
}

.shop-item.disabled {
    background-color: rgb(200, 200, 200);
    border: 4px solid rgb(140, 140, 140);
}

.shop-item.disabled img {
    filter: grayscale(80%);
}

.shop-item.disabled:hover {
    border: 4px solid rgb(140, 140, 140);
    cursor: unset;
}

.shop-item.disabled:active {
    background-color: rgb(200, 200, 200);
    border: 4px solid rgb(140, 140, 140);
    transform: unset;
}

.souls-contained {
    width: 40px;
    height: 40px;
    transform: translateY(4px);
}

.lbl-shop-category {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: 8px;
    margin-bottom: 8px;
    font-size: 22px;
}

.lbl-shop-category span {
    margin-right: 50%;
}

.shop-item-row {
    display: flex;
    width: 100%;
    justify-content: center;
    gap: 8px;
}

.cost {
    width: 22px;
    height: 22px;
    transform: translateY(4px);
}

.shop-item {
    position: relative;
    width: 96px;
    height: 96px;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: var(--accent-1);
    border: 4px solid var(--accent-1-dark);
    border-radius: 8px;
}

.shop-item:hover {
    border: 4px solid white;
    cursor: pointer;
}

.shop-item:active {
    background-color: var(--accent-1-dark);
    border: 4px solid white;
    transform: scale(0.95);
}

.lbl-cost {
    transform: translateY(-8px);
}

.shop {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--accent-2);
    border: 8px solid var(--accent-2-dark);
    border-radius: 16px;
    padding: 24px;
    position: absolute;
}

.btn-exit {
    position: absolute;
    top: -16px;
    right: -16px;
    color: white;
    font-size: 28px;
    cursor: pointer;
    width: 36px;
    height: 36px;
    line-height: 1;
    border-radius: 50%;
    background-color: #ac3232;
    border: 4px solid #961b1b;
}

.btn-exit:hover {
    border: 4px solid white;
}
</style>