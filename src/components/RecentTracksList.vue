<template>
  <div class="music-section">
    <div class="filter-container">
      <label for="genre-select" class="filter-label">FILTRAR POR GÉNERO:</label>
      <select v-model="selectedGenre" class="genre-select">
        <option value="">Todos los géneros</option>
        <option v-for="genre in genres" :key="genre" :value="genre">
          {{ genre }}
        </option>
      </select>
    </div>
    <div class="tracks-container">
      <transition-group name="fade" appear>
        <TrackCard
          v-for="track in sortedTracks"
          :key="track.id"
          :track="track"
          :error-handler="errorHandler"
        />
      </transition-group>
    </div>
    <transition name="fade">
    <div v-if="errorMessage" class="error-popup">
            <div class="error-message">{{ errorMessage }}</div>
    </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useTracksStore } from '../store/tracksStore';
import TrackCard from './TrackCard.vue';

const tracksStore = useTracksStore();
const tracks = ref([]);
const errorMessage = ref('');
const selectedGenre = ref('');
const genres = computed(() => {
  const allGenres = tracksStore.tracks.map(track => track.genre);
  return Array.from(new Set(allGenres));
});

//PROPIEDAD COMPUTADA PARA OBTENER LOS TRACKS ORDENADOS Y FILTRADOS
const sortedTracks = computed(() => {
    let filteredTracks = tracks.value;
    if (selectedGenre.value) {
        filteredTracks = filteredTracks.filter(track => track.genre === selectedGenre.value);
    }
    return filteredTracks.sort((a, b) => {
        return new Date(b.upload_date) - new Date(a.upload_date);
    });
});

//POR SI CAMBIA EL DOM DE LOS TRACKS, TENERLO ACTUALIZADO
onMounted(async () => {
  await fetchTracks();
});

watch(errorMessage, (newValue) => {
    if (newValue) {
            setTimeout(() => {
            errorMessage.value = '';
        }, 1500);
    }
});

const errorHandler = (msg) => {
  errorMessage.value = msg;
};

//OBTENER LOS TRACKS DEL STORE
const fetchTracks = async () => {
  try {
    await tracksStore.fetchAllTracks();
    tracks.value = tracksStore.tracks;
  } catch (error) {
    console.error("Error fetching tracks:", error);
  }
};

</script>

<style scoped>
.music-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.filter-container {
  display: flex;
  flex-direction: inline;
  align-items: center;
  background-color: black;
  padding: 4px 20px;
  margin-bottom: 10px;
  border-radius: 5px;
  width: auto;
}
.filter-label {
  color: white;
  margin-bottom: 5px;
  font-size: 16px;
  padding: 5px 0px 0 0;
  font-family: 'Raleway-Medium', sans-serif;
  font-weight: 500;
}
.genre-select {
  color: white;
  background-color: black;
  border: 1px solid rgb(0, 0, 0);
  outline: none;
  border-radius: 10px;
  padding: 5px 0px;
  cursor: pointer;
  font-size: 16px;
  font-family: 'Raleway-Medium', sans-serif;
  text-transform: uppercase;
  width: auto;
}

.tracks-container {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
  width: 100%;
}
.fade-enter-active {
  opacity: 0;
}

.fade-enter-to {
  opacity: 1;
}

.error-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  z-index: 1000;
}
.error-message {
  font-family: 'Poppins-SemiBold', sans-serif;
  color: red;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
