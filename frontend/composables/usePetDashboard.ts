export const usePetDashboard = () => {
  const pets = ref([])
  const loading = ref(false)
  const error = ref(null)

  const statistics = computed(() => {
    const total = pets.value.length
    const lost = pets.value.filter(p => p.status === 'lost').length
    const found = pets.value.filter(p => p.status === 'found').length
    const adopted = pets.value.filter(p => p.status === 'adopted').length
    const available = pets.value.filter(p => p.status === 'available').length

    const adoptionRate = total > 0 ? ((adopted / total) * 100).toFixed(1) : '0'
    const lostRate = total > 0 ? ((lost / total) * 100).toFixed(1) : '0'

    return {
      total,
      lost,
      found,
      adopted,
      available,
      adoptionRate,
      lostRate
    }
  })

  const lostPetsWithLocation = computed(() => {
    return pets.value.filter(
      p => p.status === 'lost' && p.location_lat && p.location_lng
    )
  })

  const fetchPets = async () => {
    // loading.value = true
    // error.value = null
    //
    // try {
    //   const { data, error: fetchError } = await $supabase
    //     .from('pets')
    //     .select('*')
    //     .order('reported_date', { ascending: false })
    //
    //   if (fetchError) throw fetchError
    //
    //   pets.value = data || []
    // } catch (err) {
    //   error.value = err.message
    //   console.error('Error fetching pets:', err)
    // } finally {
    //   loading.value = false
    // }
  }

  return {
    pets,
    loading,
    error,
    statistics,
    lostPetsWithLocation,
    fetchPets
  }
}
