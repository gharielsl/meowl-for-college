<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';

const props = defineProps<{
    cat: Cat;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'talk-reaction', happiness: number): void;
}>();

let msgId = props.cat.messages && props.cat.messages.length > 0
    ? Math.max(...props.cat.messages.map(m => m.id)) + 1
    : 0;

const messages = ref<ChatMessage[]>(
    props.cat.messages && props.cat.messages.length > 0
        ? [...props.cat.messages] // previous messages
        : [ // default first message
            {
                id: msgId++,
                sender: 'cat',
                text: `Meow! I am ${props.cat.name}. Hope you're not planning to... cook me or anything? 🙀`
            }
        ]
);

const userInput = ref('');
const isLoading = ref(false);
const chatHistoryRef = ref<HTMLDivElement | null>(null);

function scrollToBottom() {
    nextTick(() => {
        if (chatHistoryRef.value) {
            chatHistoryRef.value.scrollTop = chatHistoryRef.value.scrollHeight;
        }
    });
}

onMounted(() => {
    scrollToBottom();
});

// auto scroll to bottom
watch(messages, (newVal) => {
    props.cat.messages = [...newVal];
    scrollToBottom();
}, { deep: true, immediate: true });

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text || isLoading.value) return;

    userInput.value = '';
    messages.value.push({
        id: msgId++,
        sender: 'user',
        text
    });

    isLoading.value = true;
    scrollToBottom();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: props.cat.name,
                message: text
            })
        });

        if (!response.ok) {
            let errorText = "unknown error";
            try {
                const errData = await response.json();
                if (errData && typeof errData.error === 'string') {
                    const mapped = errData.error.toLowerCase();
                    if (mapped.includes("high demand")) {
                        errorText = "the model is experiencing high demand";
                    } else if (mapped.includes("quota")) {
                        errorText = "quota reached";
                    } else {
                        errorText = errData.error;
                    }
                }
            } catch (e) {

            }
            throw new Error(errorText);
        }

        const data = await response.json();
        const happiness = Number(data.happiness ?? 5);
        const catResponse = String(data.response ?? "Purr... (is silent)");

        emit('talk-reaction', happiness);

        // happiness 0-4 bad, 5-10 good
        const loveChange = happiness - 5;

        props.cat.love = Math.max(0, props.cat.love + loveChange);

        messages.value.push({
            id: msgId++,
            sender: 'cat',
            text: catResponse,
            happiness,
            loveDelta: loveChange
        });
    } catch (err: any) {
        console.error("Failed to fetch talk response", err);
        let errorMsg = "unknown error";
        if (err && err.message) {
            const lowerMsg = err.message.toLowerCase();
            if (lowerMsg.includes("high demand") || lowerMsg.includes("experiencing high demand")) {
                errorMsg = "the model is experiencing high demand";
            } else if (lowerMsg.includes("quota") || lowerMsg.includes("quota reached")) {
                errorMsg = "quota reached";
            }
        }

        emit('talk-reaction', 0);

        messages.value.push({
            id: msgId++,
            sender: 'cat',
            text: `Hiss! (Error: ${errorMsg}) 😾`
        });
    } finally {
        isLoading.value = false;
        scrollToBottom();
    }
}
</script>

<template>
    <div @click="(e) => e.stopPropagation()" class="talk-modal">
        <button @click="emit('close')" class="btn-exit" aria-label="Close">x</button>
        
        <div class="talk-header">
            <span class="lbl-colorful">Talk with {{ cat.name }}</span>
            <div class="header-status">
                <span class="cat-badge-love">
                    <img draggable="false" class="heart-icon" src="/love.png" />
                    Love: {{ cat.love }}
                </span>
            </div>
        </div>

        <div class="chat-history" ref="chatHistoryRef">
            <div 
                v-for="msg in messages" 
                :key="msg.id" 
                :class="['message-row', msg.sender === 'user' ? 'user-row' : 'cat-row']"
            >
                <div :class="['bubble', msg.sender === 'user' ? 'user-bubble' : 'cat-bubble']">
                    <p class="bubble-text">{{ msg.text }}</p>
                    
                    <div v-if="msg.loveDelta !== undefined" class="delta-badge" :class="msg.loveDelta >= 0 ? 'plus' : 'minus'">
                        <span v-if="msg.loveDelta > 0">Loved it! Love +{{ msg.loveDelta }} ❤️</span>
                        <span v-else-if="msg.loveDelta < 0">Disliked! Love {{ msg.loveDelta }} 💔</span>
                        <span v-else>Neutral Response 😐</span>
                    </div>
                </div>
            </div>

            <div v-if="isLoading" class="message-row cat-row">
                <div class="bubble cat-bubble loading-bubble">
                    <span class="dot">.</span>
                    <span class="dot">.</span>
                    <span class="dot">.</span>
                    <span class="loading-label">{{ cat.name }} is meowing...</span>
                </div>
            </div>
        </div>

        <form @submit.prevent="sendMessage" class="chat-input-area">
            <input 
                v-model="userInput" 
                placeholder="Say something nice to the cat..." 
                class="talk-input" 
                maxlength="200"
                :disabled="isLoading"
            />
            <button type="submit" class="btn-send" :disabled="isLoading || !userInput.trim()">
                Send
            </button>
        </form>
    </div>
</template>

<style scoped>
.talk-modal {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--accent-2);
    border: 8px solid var(--accent-2-dark);
    border-radius: 20px;
    padding: 24px;
    position: absolute;
    width: 480px;
    max-width: 90vw;
    height: 520px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
    z-index: 1010;
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
    z-index: 1020;
    text-shadow: 1px 1px 0 black;
}

.btn-exit:hover {
    border: 4px solid white;
    transform: scale(1.05);
}

.talk-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 12px;
    margin-bottom: 12px;
}

.header-status {
    margin-top: 6px;
}

.cat-badge-love {
    background-color: rgba(0, 0, 0, 0.25);
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 20px;
    color: #ffb7c5;
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: bold;
}

.heart-icon {
    width: 20px;
    height: 20px;
}

.chat-history {
    flex-grow: 1;
    overflow-y: auto;
    background-color: rgba(255, 255, 255, 0.15);
    border: 4px solid var(--accent-2-dark);
    border-radius: 12px;
    padding: 12px;
    margin-bottom: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.chat-history::-webkit-scrollbar {
    width: 8px;
}
.chat-history::-webkit-scrollbar-track {
    background: transparent;
}
.chat-history::-webkit-scrollbar-thumb {
    background: var(--accent-2-dark);
    border-radius: 4px;
}

.message-row {
    display: flex;
    width: 100%;
}

.user-row {
    justify-content: flex-end;
}

.cat-row {
    justify-content: flex-start;
}

.bubble {
    max-width: 80%;
    padding: 10px 14px;
    border-radius: 16px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    position: relative;
    user-select: text;
}

.bubble-text {
    margin: 0;
    font-size: 20px;
    line-height: 1.3;
    word-break: break-word;
    user-select: text;
}

.user-bubble {
    background-color: var(--accent-1);
    border: 4px solid var(--accent-1-dark);
    color: white;
    border-bottom-right-radius: 2px;
}

.cat-bubble {
    background-color: #ffffff;
    border: 4px solid #2b2d42;
    color: #2b2d42;
    border-bottom-left-radius: 2px;
}

.loading-bubble {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #555;
    font-style: italic;
}

.loading-label {
    margin-left: 6px;
    font-size: 16px;
}

@keyframes flash {
    0%, 100% { opacity: 0.2; }
    50% { opacity: 1; }
}

.dot {
    animation: flash 1.4s infinite;
    font-size: 24px;
    font-weight: bold;
}
.dot:nth-child(2) {
    animation-delay: 0.2s;
}
.dot:nth-child(3) {
    animation-delay: 0.4s;
}

.delta-badge {
    margin-top: 6px;
    font-size: 15px;
    font-weight: bold;
    padding: 2px 8px;
    border-radius: 8px;
    display: inline-block;
}

.delta-badge.plus {
    background-color: #e6fffa;
    color: #0b6151;
    border: 1px solid #c6f6d5;
}

.delta-badge.minus {
    background-color: #fff5f5;
    color: #9b2c2c;
    border: 1px solid #fed7d7;
}

.chat-input-area {
    display: flex;
    gap: 8px;
}

.talk-input {
    flex-grow: 1;
    background-color: #ffffff;
    border: 4px solid var(--accent-2-dark);
    border-radius: 12px;
    padding: 8px 12px;
    font-size: 20px;
    color: #2b2d42;
    outline: none;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
    user-select: text !important;
}

.btn-send {
    background-color: var(--accent-1);
    border: 4px solid var(--accent-1-dark);
    border-bottom-width: 8px;
    color: white;
    border-radius: 12px;
    padding: 0 20px;
    font-size: 22px;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.1s;
    display: flex;
    align-items: center;
    justify-content: center;
    text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.3);
}

.btn-send:hover:not(:disabled) {
    border-color: white;
    transform: translateY(-2px);
}

.btn-send:active:not(:disabled) {
    border-bottom-width: 4px;
    transform: translateY(2px);
}

.btn-send:disabled {
    cursor: not-allowed;
    background-color: #cccccc;
    border-color: #aaaaaa;
    color: #888888;
    border-bottom-width: 4px;
}
</style>
