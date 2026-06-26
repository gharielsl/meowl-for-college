<script setup lang="ts">
import { ref, computed, useTemplateRef, onMounted, onUnmounted } from 'vue';
import CreateCat from './CreateCat.vue';
import Button from './Button.vue';
import Snacks from './Snacks.vue';
import Options from './Options.vue';
import Shop from './Shop.vue';
import { saveData } from './save-data.ts';
import { deleteData, formatNumber } from './util.ts';
import Talk from './Talk.vue';

const MODE_CREATE = 0;
const MODE_EAT = 1;
const MODE_TALK = 2;

const theCatPhrases = [
  "The cat sat on the mat, wearing a tiny hat and plotting world domination with a yarn ball.",
  "I tried to eat the cat, but it turned out the cat was just a very fluffy, sentient lasagna.",
  "A whisker here, a meow there, my fuzzy roommate is demanding extra treats and belly rubs.",
  "Deep-fried cat? No thanks, I prefer mine purring softly and judging me from the bookshelf.",
  "My cat thinks he is a ninja, but he mostly just trips over his own paws while chasing ghosts.",
  "I nibbled on the cat, only to find he was secretly a spicy taco wrapped in a blanket of fur.",
  "Purr-fection is a warm kitten sleeping on your keyboard while you try to send important emails.",
  "Eating a cat is a terrible idea, unless the cat is actually a strangely shaped cinnamon roll.",
  "Cats are liquid, which explains why they fit into tiny boxes and melt into puddles on the floor.",
  "I took a bite of the cat, but it was just a giant marshmallow shaped like a grumpy tuxedo pet.",
  "Nothing beats the sound of a purring cat, unless it's the sound of a cat demanding dinner at 3 AM.",
  "Crunchy cat treat? I accidentally ate the cat-shaped cracker, but the real cat is safe and sound.",
  "My cat is a master of disguise, pretending to be a rug until I open a can of tuna in the kitchen.",
  "Who needs a snack when you can just eat the cat? Wait, no, he is made of fur and bad attitudes.",
  "If cats had thumbs, they would definitely be running the stock market and banning vacuum cleaners.",
  "I tried to eat the cat, but it was just a mirage caused by too much screen time and lack of sleep.",
  "Cat logic: if I fits, I sits, even if the box is five sizes too small for my fluffy body.",
  "Nibbling on the cat's ear? He loves it, even if he pretends to be annoyed by my human affection.",
  "The cat is the king of the house, and I am merely the humble servant who provides the kibble.",
  "I ate the cat, but then I woke up and realized I had actually just finished a cat-shaped cookie."
];

// main menu
const started = ref<boolean>(false);

// menus
const phraseActive = ref<boolean>(false);
const optionsActive = ref<boolean>(false);
const shopActive = ref<boolean>(false);
const talkActive = ref<Cat | null>(null);

const mode = ref<number>(MODE_CREATE);

// animations
const showEatHover = ref<boolean>(true);
const animatingLove = ref<Cat | null>(null);
const showEatHoverTimeout = ref<number | null>(null);
const loveAnimationTimeout = ref<number | null>(null);
const phraseTimeout = ref<number | null>(null);

let catIdCounter = 0;

// sound
const bgSound = useTemplateRef<HTMLAudioElement>('bg-sound');
const createCatSound = useTemplateRef<HTMLAudioElement>('create-sound');
const eatCatSound = useTemplateRef<HTMLAudioElement>('eat-sound');
const theCatSound = useTemplateRef<HTMLAudioElement>('the-cat-sound');
const purrchaseSound = useTemplateRef<HTMLAudioElement>('purrchase-sound');
const feedSound = useTemplateRef<HTMLAudioElement>('feed-sound');
const talkGoodSound = useTemplateRef<HTMLAudioElement>('talk-good-sound');
const talkBadSound = useTemplateRef<HTMLAudioElement>('talk-bad-sound');
// elements
const theCatPhrase = useTemplateRef<HTMLParagraphElement>('the-cat-phrase');
const itemDrag = useTemplateRef<HTMLDivElement>('item-drag');

const vol1Audio = [bgSound];
const vol2Audio = [createCatSound, eatCatSound, theCatSound, purrchaseSound, feedSound, talkGoodSound, talkBadSound];

const onMouseMove = (e: MouseEvent) => {
  if (itemDrag.value) {
    document.body.style.cursor = 'grabbing';
    itemDrag.value.style.display = 'block';
    itemDrag.value.style.left = e.clientX + 'px';
    itemDrag.value.style.top = e.clientY + 'px';
  }
}

const onMouseUp = (e: MouseEvent) => {
  document.body.style.cursor = 'unset';
  if (itemDrag.value)
    itemDrag.value.style.display = 'none';
  saveData.itemDrag = null;
}

const catMouseUp = (e: MouseEvent, cat: Cat) => {
  e.stopPropagation();
  if (saveData.itemDrag) {
    const index = saveData.itemDrag.item.saveDataIndex;
    cat.love = saveData.itemDrag.item.loveTransform(cat.love);

    // dec item count
    if (saveData.itemDrag.item.stacking)
      if (saveData.items[index])
        saveData.items[index]--;

    // love pop animation
    showEatHover.value = false;
    animatingLove.value = cat;
    onFeed();
    if (showEatHoverTimeout.value)
      clearTimeout(showEatHoverTimeout.value);
    if (loveAnimationTimeout.value)
      clearTimeout(loveAnimationTimeout.value);
    showEatHoverTimeout.value = setTimeout(() => {
      showEatHover.value = true;
    }, 800) as unknown as number;
    // used to prevent custom cursor and hover of eat/talk modes
    loveAnimationTimeout.value = setTimeout(() => {
      animatingLove.value = null;
    }, 300) as unknown as number;
  }
  onMouseUp(e);
}

onMounted(() => {
  setVolume1();
  setVolume2();
  addEventListener('mousemove', onMouseMove);
  addEventListener('mouseup', onMouseUp);
});

onUnmounted(() => {
  removeEventListener('mousemove', onMouseMove);
  removeEventListener('mouseup', onMouseUp);
});

// 512px per item, spaced by 256px
const containerWidth = computed(() => {
  return saveData.cats.length > 0 ? ((saveData.cats.length - 1) * 256) + 512 : 0;
});

// color scale matrix
function getColorMatrix(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return `
    ${r} 0 0 0 0
    0 ${g} 0 0 0
    0 0 ${b} 0 0
    0 0 0 1 0
  `.trim();
}

// the cat phrase
function getPhrase() {
  if (theCatPhrase.value == null) return;
  const phrase = theCatPhrases[Math.floor(Math.random() * theCatPhrases.length)];
  theCatPhrase.value.innerText = phrase as string;
  phraseActive.value = true;
  if (theCatSound.value) {
    theCatSound.value.currentTime = 0;
    theCatSound.value.play();
  }
  // show for 5 seconds
  if (phraseTimeout.value != null) clearTimeout(phraseTimeout.value);
  phraseTimeout.value = setTimeout(() => {
    phraseActive.value = false;
  }, 5000) as unknown as number;
}

function spawnCat(catPayload: Omit<Cat, 'id'>) {
  saveData.played = true;
  saveData.cats.push({
    ...catPayload,
    id: catIdCounter++
  });
  if (createCatSound.value) {
    createCatSound.value.currentTime = 0;
    createCatSound.value.play();
  }
}

function onPurrchase() {
  if (!purrchaseSound.value) return;
  purrchaseSound.value.currentTime = 0;
  purrchaseSound.value.play();
}

function onFeed() {
  if (!feedSound.value) return;
  feedSound.value.currentTime = 0;
  feedSound.value.play();
}

function onTalkReaction(happiness: number) {
  if (happiness >= 5) {
    if (talkGoodSound.value) {
      talkGoodSound.value.currentTime = 0;
      talkGoodSound.value.play();
    }
  } else {
    if (talkBadSound.value) {
      talkBadSound.value.currentTime = 0;
      talkBadSound.value.play();
    }
  }
}

// eat cat and harvest souls
function eatCat(cat: Cat) {
  saveData.cats = saveData.cats.filter(v => v !== cat);
  if (eatCatSound.value) {
    eatCatSound.value.currentTime = 0;
    eatCatSound.value.play();
  }
  saveData.catsEaten++;
  let souls = 1 + (cat?.love || 0);
  if (cat?.name === 'ינשול')
    souls = Math.floor(souls / 2); // meowls are more precious
  saveData.catsSouls += souls;
}

function clickCat(cat: Cat) {
  if (mode.value === MODE_EAT) eatCat(cat);
  else if (mode.value === MODE_TALK) talkActive.value = cat;
}

// main menu exited, game started
function start() {
  started.value = true;
  bgSound.value?.play();
}

function setVolume1() {
  vol1Audio.forEach(({ value }) => {
    if (value) value.volume = saveData.vol1 / 100;
  });
}

function setVolume2() {
  vol2Audio.forEach(({ value }) => {
    if (value) value.volume = saveData.vol2 / 100;
  });
}

// back to main menu
function exit() {
  started.value = false;
  if (!bgSound.value) return;
  bgSound.value.currentTime = 0;
  bgSound.value.pause();
}

async function reset() {
  await deleteData()
  window.location.reload();
}
</script>

<template>
  <div ref="item-drag" v-if="saveData.itemDrag" class="item-drag">
    <img draggable="false" :src="saveData.itemDrag?.item.img">
  </div>
  <div v-if="!started" class="startup">
    <img draggable="false" class="logo-name" src="/logo_name.png">
    <div class="btn-start">
      <Button @click="start" color-top="var(--accent-1)" color-side="var(--accent-1-dark)"
        color-edge="var(--accent-1-darker)" color-edge-hover="white">Click to Start</Button>
    </div>
    <img draggable="false" class="startup-image-0" src="/startup_0.gif">
    <img draggable="false" class="startup-image-1" src="/startup_1.gif">
    <div class="startup-text">
      <p>
        Welcome to Meow I'm a Cat Eater,
      </p>
      <p>
        a game where you spoil your cats only to then betray and eat them.
      </p>
    </div>
    <button v-if="saveData.played" @click="reset" class="btn-reset">Reset Game</button>
  </div>
  <audio ref="bg-sound" src="./bg.mp3" loop></audio>
  <audio ref="eat-sound" src="./eat.mp3"></audio>
  <audio ref="create-sound" src="./born.mp3"></audio>
  <audio ref="the-cat-sound" src="./the_cat_voice.mp3"></audio>
  <audio ref="purrchase-sound" src="./purrchase.mp3"></audio>
  <audio ref="feed-sound" src="./feed.mp3"></audio>
  <audio ref="talk-good-sound" src="./talk_good.mp3"></audio>
  <audio ref="talk-bad-sound" src="./talk_bad.mp3"></audio>
  <div class="top">
    <span class="lbl-stat"><img draggable="false" style="width: 32px; height: 32px;" src="/cat_soul.png"> Cat Souls: {{
      formatNumber(saveData.catsSouls)
      }}</span>
    <span class="lbl-stat"><img draggable="false" style="width: 32px; height: 32px;" src="/cat_count.png"> Cats Eaten:
      {{
        formatNumber(saveData.catsEaten) }}</span>
  </div>
  <div class="left">
    <div style="display: flex; gap: 8px">
      <img draggable="false" @click="exit" class="btn-small" src="/btn_exit.png">
      <img draggable="false" @click="optionsActive = true" class="btn-small" src="/btn_options.png">
      <img draggable="false" @click="shopActive = true" class="btn-small" src="/btn_shop.png">
    </div>
  </div>
  <div class="snacks-container">
    <Snacks />
  </div>
  <svg id="wave" viewBox="0 0 1440 150" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1440,70 Q1080,95 720,70 T0,70 L0,150 L1440,150 Z" fill="var(--accent-1)" />
    <path d="M1440,70 Q1080,95 720,70 T0,70" fill="none" stroke="var(--accent-1-dark)" stroke-width="4"
      stroke-linecap="round" />
  </svg>
  <div class="bottom">
    <div class="modes">
      <Button @click="mode = MODE_CREATE" color-top="var(--accent-2)" color-side="var(--accent-2-dark)"
        color-edge="var(--accent-2-darker)" :color-edge-hover="mode !== MODE_CREATE ? 'white' : ''"
        :toggled="mode === MODE_CREATE">Create Cat</Button>
      <Button @click="mode = MODE_EAT" color-top="var(--accent-2)" color-side="var(--accent-2-dark)"
        color-edge="var(--accent-2-darker)" :color-edge-hover="mode !== MODE_EAT ? 'white' : ''"
        :toggled="mode === MODE_EAT">Eat Cat</Button>
      <Button @click="mode = MODE_TALK" color-top="var(--accent-2)" color-side="var(--accent-2-dark)"
        color-edge="var(--accent-2-darker)" :color-edge-hover="mode !== MODE_TALK ? 'white' : ''"
        :toggled="mode === MODE_TALK">Talk</Button>
    </div>
    <img draggable="false" class="the-cat" @click="getPhrase" src="/the_cat.png">
  </div>
  <div class="right" v-if="mode === MODE_CREATE">
    <CreateCat @create-cat="spawnCat" />
  </div>
  <div class="cats-container">
    <div class="cats" :style="{ width: containerWidth + 'px' }">
      <div v-for="(cat, index) in saveData.cats" :key="cat.id" class="cat-wrapper" :style="{
        transform: `translateX(${index * 256}px)`,
        zIndex: index
      }">
        <div @mouseup="(e) => catMouseUp(e, cat)" class="cat-inner" :class="{
          'is-eat-mode': mode === MODE_EAT && !saveData.itemDrag && showEatHover,
          'is-talk-mode': mode === MODE_TALK && !saveData.itemDrag && showEatHover
        }" @click="clickCat(cat)">
          <svg width="0" height="0" style="position: absolute;">
            <filter :id="'filter-' + cat.id">
              <feColorMatrix type="matrix" :values="getColorMatrix(cat.color)" />
            </filter>
          </svg>

          <img draggable="false" :src="cat.template.image" class="cat-img"
            :style="{ filter: `url(#filter-${cat.id})` }" />

          <img draggable="false" v-if="!saveData.itemDrag" src="/eyes.png" class="cat-eyes"
            :style="{ left: cat.template.eyes[0] + 'px', top: cat.template.eyes[1] + 'px' }" />
          <span class="cat-name lbl-colorful" :style="{ left: cat.template.eyes[0] + 'px', color: 'white' }">{{ cat.name
            }}</span>
          <span :class="{ 'cat-love': true, pop: animatingLove === cat }" :key="cat.love"
            :style="{ left: cat.template.eyes[0] + 'px' }"><img draggable="false" src="/love.png"> x
            {{ formatNumber(cat.love) }}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="talk-bubble-container" :style="{
    opacity: phraseActive ? 1 : 0,
    pointerEvents: phraseActive ? 'auto' : 'none'
  }">
    <div class="talk-bubble">
      <p ref="the-cat-phrase" style="margin: 0; color: #2b2d42; font-size: 22px; line-height: 1.4;">
      </p>
    </div>
  </div>

  <div @click="optionsActive = false" v-if="optionsActive" class="z-cover">
    <Options @volume-change-vol1="setVolume1" @volume-change-vol2="setVolume2" @close="optionsActive = false" />
  </div>
  <div @click="shopActive = false" v-if="shopActive" class="z-cover">
    <Shop @close="shopActive = false" @purrchase="onPurrchase" />
  </div>
  <div @click="talkActive = null" v-if="talkActive" class="z-cover">
    <Talk :cat="talkActive" @close="talkActive = null" @talk-reaction="onTalkReaction" />
  </div>
</template>

<style scoped>
.btn-reset {
  position: absolute;
  bottom: 8px;
  left: 8px;
  padding: 8px;
  border: 8px solid #961b1b;
  background-color: #ac3232;
  border-radius: 8px;
}

.btn-reset:hover {
  border: 8px solid white;
}

@keyframes pop {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.2);
  }

  100% {
    transform: scale(1);
  }
}

.pop {
  animation: pop 0.3s ease-out;
}

.item-drag {
  pointer-events: none;
  position: absolute;
  display: none;
  z-index: 1000;
  transform: translate(-50%, -50%);
}

.item-drag img {
  width: 64px;
  height: 64px;
}

.z-cover {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.the-cat {
  cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.the-cat:hover {
  transform: translateY(-4px);
}

.talk-bubble-container {
  position: absolute;
  z-index: 999;
  bottom: 104px;
  right: 8px;
  transition: opacity 0.3s ease-in-out;
}

.talk-bubble {
  position: relative;
  background-color: #ffffff;
  border: 8px solid #2b2d42;
  border-radius: 24px;
  padding: 8px;
  max-width: 300px;
}

.talk-bubble::before {
  content: "";
  position: absolute;
  bottom: -15px;
  right: 62px;
  width: 20px;
  height: 20px;
  background-color: #ffffff;
  border-right: 8px solid #2b2d42;
  border-bottom: 8px solid #2b2d42;
  transform: rotate(45deg);
}

.startup-text {
  position: absolute;
  right: 16px;
  bottom: 16px;
  font-size: 22px;
  background-color: var(--accent-2);
  border: 8px solid var(--accent-2-dark);
  border-radius: 16px;
  padding: 16px;
}

.startup-text p {
  margin: 0;
}

.startup-image-0 {
  pointer-events: none;
  position: absolute;
  top: 0;
  right: 0;
}

.startup-image-1 {
  pointer-events: none;
  position: absolute;
  bottom: 0;
  left: 10%;
}

.logo-name {
  position: absolute;
  top: 8%;
  left: 50%;
  animation: pulse 1s infinite ease-in-out;
}

@keyframes pulse {

  0%,
  100% {
    transform: translateX(-50%) scale(1);
  }

  50% {
    transform: translateX(-50%) scale(1.1);
  }
}

.btn-start {
  font-size: 0;
  color: white;
  border: none;
  width: 224px;
  height: 128px;
  border-radius: 16px;
  cursor: pointer;
  animation: float 2s ease-in-out infinite;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.startup {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: url(/bg.png);
  background-repeat: repeat;
  z-index: 1000;
  overflow: hidden;
}

.top {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  gap: 64px;
}

@media (max-width: 1024px) {
  .top {
    flex-direction: column;
    gap: 8px;
  }
}

.left {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 999;
  display: flex;
  flex-direction: column;
}

.snacks-container {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(calc(-50% - 64px));
  z-index: 999;
}

.bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  bottom: 8px;
  left: 16px;
  right: 16px;
  height: 144px;
  z-index: 999;
}

.cats-container {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  padding: 20px;
}

.cats {
  position: relative;
  height: 512px;
  transition: width 0.5s ease;
  flex-shrink: 0;
}

.cat-wrapper {
  position: absolute;
  width: 512px;
  height: 512px;
  top: 0;
  left: 0;
  transition: transform 0.5s ease, opacity 0.3s ease;
}

.cat-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.is-eat-mode:hover {
  transform: translateY(-20px);
  cursor: url('/cur_eat.png'), auto;
}

.is-eat-mode:hover .cat-eyes {
  display: block;
}

.is-eat-mode:hover .cat-love {
  display: none;
}

.is-talk-mode:hover {
  transform: translateY(-20px);
  cursor: url('/cur_talk.png'), auto;
}

.cat-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
}

.cat-eyes {
  position: absolute;
  display: none;
  z-index: 10;
  pointer-events: none;
  image-rendering: pixelated;
}

.cat-eyes {
  pointer-events: none;
  position: absolute;
  display: none;
  z-index: 10;
  pointer-events: none;
  image-rendering: pixelated;
}

.cat-name {
  width: 128px;
  text-align: center;
  pointer-events: none;
  position: absolute;
  z-index: 10;
  pointer-events: none;
  top: 0;
  color: #d77bba;
  font-weight: bolder;
  font-size: 44px;
  user-select: none;
}

.cat-love {
  width: 128px;
  text-align: center;
  position: absolute;
  z-index: 10;
  pointer-events: none;
  top: 64px;
  color: #fc4ea5;
  font-weight: bolder;
  font-size: 28px;
  user-select: none;
  display: block;
  text-shadow:
    -1px -1px 0 black,
    1px -1px 0 black,
    -1px 1px 0 black,
    1px 1px 0 black
}

.eat-hover .cat-eyes {
  display: none;
}

.cat-love img {
  width: 32px;
  height: 32px;
}

.eat-hover {
  transform: translateY(-20px);
  cursor: url('/cur_eat.png'), auto;
}

.eat-hover .cat-eyes {
  display: block;
}

.modes {
  display: flex;
  gap: 16px;
}

.right {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 256px;
  background-color: var(--accent-2);
  border-left: 8px solid var(--accent-2-dark);
  z-index: 998;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

#wave {
  position: absolute;
  width: 100%;
  bottom: 0;
  height: 320px;
  pointer-events: none;
  z-index: 999;
}

.btn-mode {
  background-color: var(--accent-2);
}

.btn-mode:hover {
  border: 8px solid var(--accent-2-dark);
}

.btn-mode.selected,
.btn-mode.selected:hover {
  border: 8px solid white;
}

.btn-small {
  width: 64px;
  height: 64px;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)
}

.btn-small:hover {
  transform: scale(1.08);
  cursor: pointer;
}
</style>
