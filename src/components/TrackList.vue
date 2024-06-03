<template>
    <div class="music-section">
    <div class="tracks-container">
        <template v-if="tracks.length > 0">
            <transition-group name="fade" appear>
                <TrackCard
                v-for="(track, index) in tracks"
                :key="keygen(track)"
                :track="track"
                />
            </transition-group>
        </template>
        <p v-else>No se encuentran tracks.</p>
    </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useTracksStore } from '../store/tracksStore';
import TrackCard from './TrackCard.vue';

const tracks = ref([]);
const tracksStore = useTracksStore();

onMounted(async () => {
    await fetchTracks();
});

const fetchTracks = async () => {
try {
    await tracksStore.fetchAllTracks();
    tracks.value = tracksStore.tracks;
} catch (error) {
    console.error("Error fetching tracks:", error);
}};
//GENERAR UN ID ALEATORIO SI NO SE ENCUENTRA EL ID DEL TRACK
const keygen = (track) => {
    return track.id || Math.random().toString(36).substr(2, 9);
};
</script>

<style scoped>
.music-section {
    margin-top: 0px;
}
.tracks-container {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 30px;
}
.fade-enter-active {
    opacity: 0;
}

.fade-enter-to {
    opacity: 1;
}
</style>
  