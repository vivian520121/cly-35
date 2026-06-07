import { watch } from 'vue'
import { useNoteStore } from '@/stores/noteStore'
import { debounce } from '@/utils/id'

export function useLocalStorage() {
  const noteStore = useNoteStore()

  noteStore.loadFromStorage()

  const debouncedSave = debounce(() => {
    noteStore.saveToStorage()
  }, 300)

  watch(
    () => noteStore.notes,
    () => {
      debouncedSave()
    },
    { deep: true }
  )
}
