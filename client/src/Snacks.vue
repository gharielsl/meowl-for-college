<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import items from './items';
import saveData from './save-data';

const scrollContainer = ref<HTMLElement | null>(null);
const thumbHeight = ref(0);
const thumbTop = ref(0);
const showThumb = ref(false);

function updateScrollbar() {
    if (!scrollContainer.value) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value;

    // overflow
    if (scrollHeight > clientHeight) {
        showThumb.value = true;
        
        const PADDING = 4;
        const usableTrackHeight = clientHeight - (PADDING * 2);

        thumbHeight.value = Math.max((clientHeight / scrollHeight) * usableTrackHeight, 20);
        
        // normalize
        const maxScrollTop = scrollHeight - clientHeight;
        const scrollProgress = scrollTop / maxScrollTop;
        
        // space the thumb by PADDING from top and bottom
        const minTop = PADDING;
        const maxTop = clientHeight - thumbHeight.value - PADDING;
        
        thumbTop.value = minTop + (scrollProgress * (maxTop - minTop));
        
    } else {
        showThumb.value = false;
    }
}

onMounted(() => {
    nextTick(() => updateScrollbar());
    window.addEventListener('resize', updateScrollbar);
});

onUnmounted(() => {
    window.removeEventListener('resize', updateScrollbar);
});

function itemMouseDown(item: Item) {
    const index = item.saveDataIndex;
    if ((item.stacking && saveData.items[index]) ||
        (!item.stacking && saveData.toyUnlocks[index])) {
        saveData.itemDrag = { item };
    }
}
</script>

<template>
    <div class="snacks">
        <div class="lbl-snacks">
            <span class="lbl-colorful">Items</span>
        </div>

        <div v-if="showThumb" 
             class="custom-scroll-thumb" 
             :style="{ height: thumbHeight + 'px', top: thumbTop + 'px' }">
        </div>

        <div class="item-scroll" ref="scrollContainer" @scroll="updateScrollbar">
            <div style="position: relative;" v-for="item in items" :key="item.saveDataIndex">
                <img draggable="false" @mousedown="() => itemMouseDown(item)" :src="item.img"
                    :class="{ 'usable': (item.stacking && (saveData.items[item.saveDataIndex] || 0) > 0) || (!item.stacking && saveData.toyUnlocks[item.saveDataIndex]) }"
                    :style="!item.stacking && !saveData.toyUnlocks[item.saveDataIndex] && 'filter: brightness(0)'">
                <span v-if="item.stacking" class="lbl-item">x {{ saveData.items[item.saveDataIndex] || 0 }}</span>
                <span class="lbl-locked" v-if="!item.stacking && !saveData.toyUnlocks[item.saveDataIndex]">Locked</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.custom-scroll-thumb {
    position: absolute;
    left: 2px;
    width: 4px;
    background-color: rgba(136, 136, 136, 0.5);
    border-radius: 10px;
    z-index: 10;
    pointer-events: none;
    transition: top 0.05s linear;
}

.item-scroll {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    flex-direction: column;
    
    -ms-overflow-style: none;
    scrollbar-width: none; 
}

.item-scroll::-webkit-scrollbar {
    display: none;
    width: 0;
}

.lbl-locked {
    position: absolute;
    top: 50%;
    left: 50%;
    color: #bf4d4d;
    font-weight: bolder;
    font-size: 22px;
    transform: translate(-50%, -50%) rotate(-23deg);
    pointer-events: none;
}

.lbl-item {
    position: absolute;
    bottom: 0;
    right: 4px;
    pointer-events: none;
}

.snacks {
    position: relative;
    display: flex;
    width: 80px;
    max-height: 576px;
    height: calc(100vh - 144px - 144px);
    background-color: var(--accent-2);
    border: 8px solid var(--accent-2-dark);
    border-radius: 16px 0 16px 16px;
}

.lbl-snacks {
    position: absolute;
    width: 128px;
    height: 64px;
    display: flex;
    justify-content: center;
    align-items: center;
    left: 100%;
    top: 0;
    transform: translateY(-7.8px);
    border-top: 8px solid var(--accent-2-dark);
    border-bottom: 8px solid var(--accent-2-dark);
    border-right: 8px solid var(--accent-2-dark);
    background-color: var(--accent-2);
    border-radius: 0 16px 16px 0;
}

img {
    width: 64px;
    height: 64px;
    user-select: none;
    transition: transform 0.15s ease-out;
}

img.usable {
    cursor: grab;
}

img.usable:hover {
    transform: scale(1.1);
}
</style>