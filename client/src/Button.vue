<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps<{
    colorTop: string;
    colorSide: string;
    colorEdge: string;
    colorEdgeHover?: string;
    toggled?: boolean; // if true, button will appear pressed and not be pressable
    onClick?: () => void;
}>();

const slots = defineSlots<{ default(): any }>();

const pressed = ref(props.toggled ?? false);
const hovered = ref(false);

watch(() => props.toggled, (val) => { pressed.value = val ?? false; });

const RX = 105, RY = 47, BOTTOM = 74, H_UP = 24, H_DOWN = 12;

const isDown = computed(() => pressed.value || props.toggled);
const ty = computed(() => BOTTOM - (isDown.value ? H_DOWN : H_UP));
const edgeColor = computed(() => hovered.value && props.colorEdgeHover ? props.colorEdgeHover : props.colorEdge);
const bodyD = computed(() =>
    `M 7,${ty.value} A ${RX},${RY} 0 0 1 217,${ty.value} L 217,${BOTTOM} A ${RX},${RY} 0 0 1 7,${BOTTOM} Z`
);

function onMouseDown() { if (!props.toggled) pressed.value = true; }
function onMouseUp() { if (!props.toggled) { pressed.value = false; props.onClick?.(); } }
function onMouseLeave() { if (!props.toggled) pressed.value = false; hovered.value = false; }
</script>

<template>
    <svg viewBox="0 0 224 128" width="224" height="128" xmlns="http://www.w3.org/2000/svg"
        :style="`display:block; cursor:${toggled ? '' : 'pointer'}; ${isDown ? 'filter:brightness(0.8)' : ''}`" @mousedown="onMouseDown"
        @mouseup="onMouseUp" @mouseenter="hovered = true" @mouseleave="onMouseLeave" @touchstart.prevent="onMouseDown"
        @touchend.prevent="onMouseUp">
        <path :d="bodyD" :fill="colorSide" :stroke="edgeColor" stroke-width="5" stroke-linejoin="round"
            stroke-linecap="round" />
        <ellipse cx="112" :cy="ty" rx="107" ry="49" :fill="colorTop" stroke="none" />
        <ellipse cx="112" :cy="ty" rx="105" ry="47" fill="none" :stroke="edgeColor" stroke-width="5" />
        
        <text x="112" :y="ty" text-anchor="middle" dominant-baseline="middle"
            font-family="cute-cat, miri, system-ui" font-size="36" font-weight="900" :fill="toggled ? colorEdge : 'white'"
            :style="{
                pointerEvents: 'none',
                userSelect: 'none',
                transformOrigin: 'center',
                transformBox: 'fill-box',
                transform: `translateY(6px) scale(${hovered && !toggled ? 1.08 : 1})`,
                transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }">
            <slot />
        </text>
    </svg>
</template>