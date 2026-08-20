<template>
  <RouterLink :to="`/catalogue/${book.id}`" class="book-card">
    <div class="book-cover">
      <img
        v-if="book.cover_url"
        :src="book.cover_url"
        :alt="book.title"
      />
      <div v-else class="book-cover-placeholder">
        <span>{{ book.title[0] }}</span>
      </div>
    </div>

    <div class="book-info">
      <h3 class="book-title">{{ book.title }}</h3>
      <p class="book-author">{{ book.author }}</p>
      <div class="book-footer">
        <span class="book-category">{{ book.category?.name }}</span>
        <span
          class="book-status"
          :class="book.available_copies > 0 ? 'available' : 'unavailable'"
        >
          {{ book.available_copies > 0 ? 'Disponible' : 'Indisponible' }}
        </span>
      </div>
    </div>
  </RouterLink>
</template>

<script setup>
defineProps({
  book: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.book-card {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
  cursor: pointer;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #1a237e;
}

.book-cover {
  height: 180px;
  overflow: hidden;
  background: #f5f5f5;
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-cover-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a237e, #3949ab);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 700;
  color: white;
}

.book-info {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex: 1;
}

.book-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a237e;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-author {
  font-size: 0.85rem;
  color: #666;
}

.book-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 0.5rem;
}

.book-category {
  font-size: 0.75rem;
  color: #888;
  background: #f0f0f0;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.book-status {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.available {
  background: #e8f5e9;
  color: #2e7d32;
}

.unavailable {
  background: #ffebee;
  color: #c62828;
}
</style>
