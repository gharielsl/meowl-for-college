<script setup lang="ts">
import { watch } from 'vue';
import { saveData } from './save-data';

const props = defineProps<{
    onClose?: () => void;
    onVolumeChangeVol1?: () => void;
    onVolumeChangeVol2?: () => void;
}>();

watch(() => saveData.vol1, () => {
    props.onVolumeChangeVol1?.();
});

watch(() => saveData.vol2, () => {
    props.onVolumeChangeVol2?.();
});
</script>

<template>
    <div @click="(e) => e.stopPropagation()" class="options">
        <button @click="onClose" class="btn-exit" aria-label="Close">x</button>

        <span class="lbl-colorful">Options</span>

        <div class="volume-control">
            <label class="lbl-volume" for="volume-1">Music</label>

            <div class="triangle-slider" :style="{ '--val': saveData.vol1 + '%' }">
                <div class="slider-fill"></div>
                <div class="slider-indicator"></div>
                <input type="range" id="volume-1" min="0" max="100" step="10" v-model.number="saveData.vol1" />
            </div>
        </div>

        <div class="volume-control">
            <label class="lbl-volume" for="volume-2">Cat noises</label>

            <div class="triangle-slider" :style="{ '--val': saveData.vol2 + '%' }">
                <div class="slider-fill"></div>
                <div class="slider-indicator"></div>
                <input type="range" id="volume-2" min="0" max="100" step="10" v-model.number="saveData.vol2" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.options {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--accent-2);
    border: 8px solid var(--accent-2-dark);
    border-radius: 16px;
    padding: 8px;
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

.volume-control {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px;
}

.lbl-volume {
    font-size: 18px;
    text-transform: uppercase;
    letter-spacing: 1px;
    transform: translateY(8px);
}

.triangle-slider {
    position: relative;
    width: 180px;
    height: 24px;
    background: var(--accent-2-dark);
    clip-path: polygon(0% 100%, 100% 0%, 100% 100%);
}

.slider-fill {
    height: 100%;
    width: var(--val);
    background: var(--accent-1-dark);
}

.slider-indicator {
    position: absolute;
    top: 0;
    bottom: 0;
    left: var(--val);
    width: 3px;
    background: #fff;
    transform: translateX(-50%);
    pointer-events: none;
}

.triangle-slider input[type="range"] {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    margin: 0;
}
</style>