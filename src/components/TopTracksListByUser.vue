<template>
    <div class="top-tracks-section">
      <div class="top-tracks-title">TRACKS DESTACADOS</div>
      <div class="tracks-container">
        <transition-group name="fade" appear>
          <TrackCard
            v-for="track in topTracks"
            :key="track.id"
            :track="track"
          />
        </transition-group>
      </div>
    </div>
</template>

<script setup>
    import { computed, onMounted } from 'vue';
    import TrackCard from './TrackCard.vue';

    const props = defineProps({
      tracks: Array
    });

    onMounted(async () => {
      console.log(props.tracks);
    }
    )
    //PROPIEDAD COMPUTADA PARA OBTENER LOS 3 TOP TRACKS DEL USUARIO
    const topTracks = computed(() => {
        return props.tracks.slice().sort((a, b) => {
        // Calcular el ranking de cada track
        const rankA = a.plays + a.like_count * 5 + a.comment_count * 10;
        const rankB = b.plays + b.like_count * 5 + b.comment_count * 10;
        // Ordenar de mayor a menor ranking
        return rankB - rankA;
        }).slice(0, 3); //Solo coge los tres primeros
    });

</script>
  
<style scoped>
  .top-tracks-section {
    margin-top: 20px;
  }
  .top-tracks-title {
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
    gap: 30px;
  }
  .fade-enter-active {
    opacity: 0;
  }
  
  .fade-enter-to {
    opacity: 1;
  }
</style>
  