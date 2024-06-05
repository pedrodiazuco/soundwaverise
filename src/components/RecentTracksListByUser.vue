<template>
    <div class="recent-tracks-section">
        <div class="recent-tracks-title">TRACKS RECIENTES</div>
        <div class="tracks-container">
        <transition-group name="fade" appear>
            <TrackCard
            v-for="track in recentTracks"
            :key="track.id"
            :track="track"
            />
        </transition-group>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import TrackCard from './TrackCard.vue';

const props = defineProps({
    tracks: Array
});

//PROPIEDAD COMPUTADA PARA OBTENER LOS TRACKS ORDENADOS POR FECHA RECIENTE
const recentTracks = computed(() => {
    return props.tracks.slice().sort((a, b) => {
    return new Date(b.upload_date) - new Date(a.upload_date);
    });
});

</script>

<style scoped>

.recent-tracks-section {
margin-top: 20px;
}
.recent-tracks-title {
    text-align: center;
    font-family: 'Anton', sans-serif;
    font-size: 40px;
    text-decoration: none;
    margin: 30px 0 10px 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}
.tracks-container {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 20px;
}
.fade-enter-active {
    opacity: 0;
}

.fade-enter-to {
    opacity: 1;
}

</style>
