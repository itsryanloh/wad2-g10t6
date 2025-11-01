<template>
  <div class="form-section">
    <div class="position-relative">
      <div class="position-relative">
        <input v-model="name" type="text" class="form-input address-input" :placeholder @keyup="input"
          @focus="() => showDropdown = true" @blur="handleBlur" />
        <i v-if="searchController" class="fas fa-spinner fa-spin search-spinner"></i>
      </div>

      <div v-if="showDropdown && valuesToReplaceSearchbox.length > 0" class="address-dropdown">
        <div v-for="(data, idx) in valuesToReplaceSearchbox" :key="idx" class="address-dropdown-item"
          @click.prevent="chooseFromDropdown(idx)">
          <LocationSuggestion v-bind="data" :suggestion-icon="suggestionIcon" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { placeholder, keyDown, selectIdx, suggestionIcon } = defineProps<{
  placeholder: string
  suggestionIcon: string
  keyDown: (searchString: string, abortSignal: AbortSignal) => Promise<Record<"title" | "description", string>[]>
  selectIdx: (idx: number) => string
}>()

const name = ref("")

const valuesToReplaceSearchbox = ref<Awaited<ReturnType<typeof keyDown>>>([])
const showDropdown = ref(false)
const searchController = ref<AbortController | null>(null)

function input(payload: KeyboardEvent) {
  if (!name.value.trim()) return valuesToReplaceSearchbox.value = []
  if (payload.key === "Enter") return chooseFromDropdown(0)
  searchController.value?.abort()
  searchController.value = new AbortController()
  keyDown(name.value, searchController.value.signal)
    .then(data =>
      showDropdown.value = (valuesToReplaceSearchbox.value = data || []).length > 0
    )
    .then(searchController.value = null)
}

function chooseFromDropdown(idx: number) {
  name.value = selectIdx(idx)
  handleBlur()
}

function handleBlur() {
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}
</script>

<style scoped>
.form-section {
  margin-bottom: 30px;
}

.section-label {
  display: flex;
  align-items: center;
  font-weight: 700;
  color: #5D4E37;
  margin-bottom: 15px;
  font-size: 1.1rem;
}

.form-input {
  width: 100%;
  padding: 15px 20px;
  border: 2px solid #FFB74D;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s;
  font-family: inherit;
}

.form-hint {
  display: block;
  color: #7A7265;
  font-size: 0.875rem;
  margin-top: 8px;
}

.address-input {
  padding-right: 45px;
}

.search-spinner {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #FF9800;
  font-size: 18px;
}

.address-dropdown {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #FFB74D;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(255, 152, 0, 0.2);
  max-height: 280px;
  overflow-y: auto;
  z-index: 1000;
  animation: dropdownSlide 0.3s ease;
}

@keyframes dropdownSlide {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.address-dropdown-item {
  padding: 15px 20px;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid #FFF5E6;
}

.address-dropdown-item:last-child {
  border-bottom: none;
}

.address-dropdown-item:hover {
  background: linear-gradient(135deg, #FFF5E6 0%, #FFE8D6 100%);
  padding-left: 25px;
}

.address-dropdown::-webkit-scrollbar {
  width: 8px;
}

.address-dropdown::-webkit-scrollbar-track {
  background: #FFF5E6;
  border-radius: 0 12px 12px 0;
}

.address-dropdown::-webkit-scrollbar-thumb {
  background: #FFB74D;
  border-radius: 10px;
  transition: all 0.3s;
}

.address-dropdown::-webkit-scrollbar-thumb:hover {
  background: #FF9800;
}
</style>
