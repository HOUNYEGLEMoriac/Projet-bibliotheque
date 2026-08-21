<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="modal-overlay" @click.self="closeModal">
        <div class="modal-card" :style="{ maxWidth: width }">

          <div class="modal-header">
            <h2>{{ title }}</h2>
            <button class="btn-close" @click="closeModal">✕</button>
          </div>

          <div class="modal-body">
            <slot />
          </div>

          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: '' },
  width: { type: String, default: '500px' }
})

const emit = defineEmits(['update:modelValue', 'close'])

function closeModal() {
  emit('update:modelValue', false)
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.5rem;
}

.modal-card {
  background: white;
  width: 100%;
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f1f5f9;
}

.modal-header h2 {
  font-size: 1.2rem;
  color: #0f172a;
  font-weight: 700;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.1rem;
  color: #64748b;
  cursor: pointer;
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.btn-close:hover {
  background: #f1f5f9;
}

.modal-body {
  padding: 1.5rem 2rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 1rem 2rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  background: #f8fafc;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
