<script setup lang="ts">
import { ref } from 'vue';
import Button from './Button.vue';
import cats from './cats';
import saveData from './save-data.ts';

const btnHovered = ref(false);

const colors = [
    '#ffffff', '#e0e0e0', '#808080', '#000000',
    '#ff0000', '#ff4500', '#ff8c00', '#ffa500',
    '#ffd700', '#ffff00', '#bfff00', '#808000',
    '#8b4513', '#00ff00', '#32cd32', '#008000',
    '#00fa9a', '#00ffff', '#00bfff', '#0000ff',
    '#000080', '#4b0082', '#800080', '#ff00ff',
    '#ff69b4', '#ffc0cb',
];

const names = [
    "ינשול", "Luna", "Oliver", "Milo", "Simba", "Nala", "Leo", "Bella",
    "Chloe", "Shadow", "Max", "Cleo", "Jasper", "Willow", "Oscar", "Lucy",
    "Felix", "Daisy", "Tiger", "Pepper", "Ruby"
];

const props = defineProps<{
    onCreateCat: (cat: Cat) => void
}>();

function randomName() {
    return names[Math.floor(Math.random() * names.length)];
}

const name = ref(randomName());
const selectedColor = ref('#ffffff');

function selectColor(color: string) {
    selectedColor.value = color;
}

function createCat() {
    const nameStr = name.value as string;
    props.onCreateCat({
        id: 0,
        name: nameStr,
        color: selectedColor.value,
        // yanshul will always be a meowl
        template: (nameStr === 'ינשול' ? cats[3] : cats[Math.floor(Math.random() * cats.length)]) as CatTemplate,
        love: 0
    });
    // put a new random name in the input
    name.value = randomName();
}
</script>

<template>
    <div class="top">
        <span class="lbl-colorful">Name</span>
        <div class="inp-name">
            <input id="cat-name" v-model="name">
        </div>
        <span class="lbl-colorful">Color</span>
        <div class="color-palette">
            <div v-for="color in colors" :key="color" class="color-item" :class="{ selected: selectedColor === color }"
                :style="{ backgroundColor: color }" @click="selectColor(color)"></div>
        </div>
    </div>
    <div @mouseenter="btnHovered = true" @mouseleave="btnHovered = false" class="btn-create">
        <Button @click="createCat" color-top="var(--accent-1)" color-side="var(--accent-1-dark)"
            color-edge="var(--accent-1-darker)" :color-edge-hover="saveData.cats.length === 20 ? '' : 'white'" :toggled="saveData.cats.length === 20">Create Cat</Button>
        <div v-if="saveData.cats.length === 20 && btnHovered" class="lbl-hungry">
            <span style="font-size: 22px;">You are hungry, take a break and eat some cats</span>
        </div>
    </div>
</template>

<style scoped>

.lbl-hungry::before {
    content: "";
    position: absolute;
    bottom: -27px;
    left: 50%;
    width: 20px;
    height: 20px;
    background-color: var(--accent-1);
    border-right: 8px solid var(--accent-1-dark);
    border-bottom: 8px solid var(--accent-1-dark);
    transform: rotate(45deg) translateX(calc(-50% * 1.41421356));
}

.lbl-hungry {
    position: absolute;
    top: -50%;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--accent-1);
    border: 8px solid var(--accent-1-dark);
    border-radius: 16px;
    padding: 8px;
    width: 180px;
}

.top {
    margin-top: 8px;
    gap: 8px;
    width: 224px;
    display: flex;
    flex-direction: column;
}

.inp-name {
    width: 100%;
    height: 80px;
    background-color: white;
    border: 8px solid var(--accent-2-dark);
    border-radius: 16px;
    overflow: hidden;
}

.inp-name input {
    width: 100%;
    height: 100%;
    font-size: 42px;
    background: transparent;
    border: none;
    outline: none;
    text-align: center;
}

.btn-create {
    position: relative;
    margin-bottom: 180px;
}

.color-item {
    aspect-ratio: 2;
    cursor: pointer;
    box-sizing: border-box;
    border: 4px solid rgba(0, 0, 0, 0.5);
    transition: transform 0.1s ease;
}

.color-item.selected {
    outline: 3px solid #ffffff;
    outline-offset: -3px;
    z-index: 2;
}

.color-palette {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    width: 100%;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    gap: 0;
}
</style>