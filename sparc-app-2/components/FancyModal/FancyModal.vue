<template>
  <div v-if="visible" class="modal-backdrop" @click.self="close">
    <div class="modal-container">
      <slot ></slot>
      <button class="modal-close" @click="close">×</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: Boolean
});
const emit = defineEmits(['close']);
const close = () => emit('close');
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  backdrop-filter: blur(6px);
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  animation: fadeIn 0.3s ease;
}

.modal-container {
  position: relative;
  background: white;
  border-radius: 16px;
  padding: 24px 32px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
  max-width: 90%;
  width: 65dvw;
  animation: popUp 0.3s ease;
  font-family: 'Segoe UI', sans-serif;
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 16px;
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
}
.modal-close:hover {
  color: #333;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes popUp {
  from {
    transform: translateY(20px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}
</style>
