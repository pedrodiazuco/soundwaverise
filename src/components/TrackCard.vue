<template>
  <div class="track-container">
    <div class="track-card" :style="{ backgroundImage: `url(${track.cover_url})` }">
      <!-- Detalles del artista y género -->  
      <div class="artist-genre-section">
            <div class="track-artist" @click="goToArtistTrackProfile">{{ track.nickname }}</div>
            <div class="track-genre"> #{{ track.genre }}</div>
        </div>
        <!-- Detalles de la canción y acciones de like/comentario -->
        <div class="title-feed-section">
            <template v-if="track && track.id">
                <div class="track-title" @click="goToTrackProfile">{{ track.title }}</div>
                <div class="feed-icons">
                    <!-- Botón de like -->
                    <button
                        class="like-btn"
                        :class="{ 'btn-disabled': !isUserLoggedIn }"
                        @click="handleLikeBtn"
                    >
                        <img v-if="userHasLiked" 
                            class="like-btn-image" 
                            src="../assets/like-icon-red.png" 
                            alt="Liked" 
                        />
                        <img v-else 
                            class="like-btn-image"
                            src="../assets/like-icon.png"
                            alt="No Liked"
                        />
                        <span class="like-count">{{ like_count }}</span>
                    </button>
                    <!-- Botón de comentarios -->
                    <button
                        class="comment-btn"
                        :class="{ 'btn-disabled': !isUserLoggedIn }"
                        @click="handleCommentBtn"
                    >
                        <img v-if="userHasCommented" 
                            class="comment-btn-image" 
                            src="../assets/comment-icon-blue.png" 
                            alt="Commented" 
                        />
                        <img v-else 
                            class="comment-btn-image" 
                            src="../assets/comment-icon.png"
                            alt="Not Commented" 
                        />
                        <span class="comment-count">{{ comment_count }}</span>
                    </button>
                </div>
            </template>
        </div>
        <!-- Sección de reproducción de música -->
        <div class="music-section">
          <!-- Botones dinámicos de Play y Pause -->
          <div class="playback-controls">
            <button v-if="!isPlaying" @click="togglePlayback" class="control-btn" :disabled="!isReady">
                <img src="../assets/play-button.png" alt="Play">
            </button>
            <button v-else @click="togglePlayback" class="control-btn">
                <img src="../assets/pause-button.png" alt="Pause">
            </button>
            <!-- Icono y número de reproducciones -->
            <div class="play-count-container">
              <img src="../assets/plays-icon.png" alt="Plays Icon" class="plays-icon">
              <span class="plays-count">{{ playCount }}</span>
            </div>
          </div>
          <!-- Onda del Track -->
          <div class="waveform-container">
              <div ref="waveformRef" class="waveform"></div>
              <span class="current-time">{{ currentTime }}</span>
              <span class="total-time">{{ totalTime }}</span>
          </div>
        </div>
    </div>
    <!-- Sección para enviar comentarios -->
    <div v-if="hasPlayedAtLeastOnce & isUserLoggedIn" class="comment-input-container">
      <img :src="authStore.currentUser.photo_url" class="user-image" alt="User Image"/>
      <input type="text" ref="commentInput" v-model="newComment" placeholder="Escribe un comentario" />
      <button @click="submitComment">Enviar</button>
    </div>
  </div>
</template>

<script setup>
import { nextTick } from "vue";
import { useRouter } from "vue-router";
import { onMounted, ref, watch, computed } from 'vue'
import { useAuthStore } from '../store/authStore';
import { useTracksStore } from "../store/tracksStore";
import WaveSurfer from 'wavesurfer.js';

const props = defineProps({
  track: Object,
  errorHandler: Function
});

const router = useRouter();
const errorMessage = ref('');
const waveformRef = ref(null);
let wavesurfer = null;
const isReady = ref(false); // Nuevo estado para controlar la disponibilidad de la reproducción
const isPlaying = ref(false);
const hasPlayedAtLeastOnce = ref(false);
const playCount = ref(props.track.plays || 0);
const playCountAdded = ref(false);

const currentTime = ref('00:00');
const totalTime = ref('00:00');

const authStore = useAuthStore();
const tracksStore = useTracksStore();
const like_count = ref(props.track.like_count || 0);
const comment_count = ref(props.track.comment_count || 0);
const userHasLiked = ref(false);
const userHasCommented = ref(false);
const commentInput = ref(null);
const newComment = ref('');

// Computed para verificar si el usuario está logueado
const isUserLoggedIn = computed(() => !!authStore.currentUser);


onMounted( async () => {
    if (isUserLoggedIn.value && props.track && props.track.id) {
        await verifyUserHasLiked();
        console.log("User has liked:", userHasLiked.value);
        await verifyUserHasCommented();
        console.log("User has commented:", userHasCommented.value);
    }
    wavesurfer = WaveSurfer.create({
        container: waveformRef.value,
        waveColor: 'white',
        progressColor: 'lightgreen',
        cursorColor: 'transparent',
        normalize: true,
        barWidth: 2,
        barRadius: 10,
        cursorColor: 'purple',
        cursorWidth: 4,
        height: 70,
        barGap: 3 // the optional spacing between bars of the wave, if not provided will be calculated in legacy format
    })
    wavesurfer.on('ready', () => {
        isReady.value = true;
        totalTime.value = formatTime(wavesurfer.getDuration());
    });
    wavesurfer.on('audioprocess', () => {
        currentTime.value = formatTime(wavesurfer.getCurrentTime());
    });
    wavesurfer.on('seek', () => {
        currentTime.value = formatTime(wavesurfer.getCurrentTime());
    });
    wavesurfer.on('play', () => {
      isPlaying.value = true;
      if (!playCountAdded.value) {
        playCount.value++;
        playCountAdded.value = true;
        tracksStore.incrementPlayCount(props.track.id);
      }
    });
    wavesurfer.on('pause', () => {
        isPlaying.value = false;
    });
    wavesurfer.on('finish', () => {
        isPlaying.value = false;
    });
    wavesurfer.on('error', (error) => {
        console.error('Error loading wavesurfer:', error);
        currentTime.value = totalTime.value;
    });
    if (props.track.audio_url) {
        wavesurfer.load(props.track.audio_url);
    }
});

watch(() => props.track.audio_url, (newUrl) => {
  if (newUrl) {
      isReady.value = false; // Resetear el estado de listo cuando cambia la URL
      wavesurfer.load(newUrl);
  }
});

watch(() => props.track.id, async (newId, oldId) => {
    if (newId !== oldId && authStore.currentUser.id) {
        await verifyUserHasCommented();
        await verifyUserHasLiked();
    }
});

watch(errorMessage, (newValue) => {
    if (newValue) {
            setTimeout(() => {
            errorMessage.value = '';
        }, 1500);
    }
});

const formatTime = time => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
};

const togglePlayback = () => {
  if (!isReady.value) return;
  wavesurfer.playPause();
  hasPlayedAtLeastOnce.value = true;
};

const verifyUserHasLiked = async () => {
    try {
        const response = await tracksStore.checkIfUserHasLiked(props.track.id, authStore.currentUser.id);
        userHasLiked.value = response;
    } catch (error) {
        console.error('Error verifying like.', error);
    }
};

const verifyUserHasCommented = async () => {
    try {
        const response = await tracksStore.checkIfUserHasCommented(props.track.id, authStore.currentUser.id);
        userHasCommented.value = response;
    } catch (error) {
        console.error('Error verifying comment.', error);
    }
};

const handleLikeBtn = () => {
    if (!isUserLoggedIn.value) {
        props.errorHandler('Debes iniciar sesión para dar like.');
        return;
    }
    if (userHasLiked.value) {
        props.errorHandler('¡Ya has dado like a este track!');
        return;
    }
    else {
        like_count.value++;
        userHasLiked.value = true;
        tracksStore.addLike(props.track.id, authStore.currentUser.id);
    }
}

const handleCommentBtn = () => {
  if (!isUserLoggedIn.value) {
    props.errorHandler('Debes iniciar sesión para poder comentar.');
        return;
    }
    hasPlayedAtLeastOnce.value = true;
    nextTick(() => {
      if (commentInput.value) {
        commentInput.value.focus();
      } else {
        console.error('El elemento de entrada del comentario no está disponible.');
      }
    });
};

const submitComment = async () => {
    if (!newComment.value.trim()) {
        props.errorHandler('El comentario no puede estar vacío.');
        return;
    }
    if (!isUserLoggedIn.value) {
        props.errorHandler('Debes iniciar sesión para comentar.');
        return;
    }
    try {
        const commentData = { user_id: authStore.currentUser.id, comment: newComment.value };
        await tracksStore.addComment(props.track.id, commentData);
        newComment.value = '';
        userHasCommented.value = true;
        comment_count.value++;

    } catch (error) {
        console.error("Error al enviar el comentario:", error);
    }
};

const goToArtistTrackProfile = () => {
    console.log(props.track.nickname);
    if (isUserLoggedIn.value) {
        if(props.track.nickname === authStore.currentUser.nickname) {
            router.push(`/${authStore.currentUser.nickname}`);
        }
        else {
            router.push(`/profile/${props.track.nickname}`);
        }
    }
    else {
        router.push(`/profile/${props.track.nickname}`)
    }
};

const goToTrackProfile = () => {
    tracksStore.setCurrentTrack(props.track);
    router.push(`/track/${encodeURIComponent(props.track.title.replace(/ /g, '-').toLowerCase())}`);
}

</script>

<style scoped>
.track-container {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
  padding: 0 0 0px 0;
  z-index: 0;
}

.track-card {
  position: relative;
  background-color: black;
  padding: 20px 40px 25px 40px;
  border-radius: 8px;
  width: 100%;
  width: calc(60% - 8vh); /* Ajusta esto según necesites */
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  background-size: cover; /* Asegura que la imagen cubra toda el área disponible */
  background-position: center; /* Centra la imagen en el contenedor */
  overflow: hidden;
  z-index: 0;
}
.track-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(28, 28, 28, 0.4); /* Añade una capa oscura sobre la imagen para mejorar la legibilidad del texto */
  background: radial-gradient(transparent, black 98%);
  z-index: 1;
}

.artist-genre-section, .title-feed-section, .music-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  text-shadow: 0px 0px 6px rgba(0, 0, 0, 1);
}
.track-artist {
  position: relative;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Poppins-SemiBold', sans-serif;
  font-size: 16px;
  cursor: pointer;
  text-decoration: none;
  z-index: 2;
}
.track-artist:hover{
    transition: all .2s;
    transform: scale(1.1);
    filter: drop-shadow(0 0 7px black);
}
.track-genre {
  position: relative;
  text-align: right;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Poppins-SemiBold', sans-serif;
  font-size: 15px;
  text-decoration: none;
  z-index: 2;
}
.track-title {
  flex: 1;
  position: relative;
  color: white;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Poppins-SemiBold', sans-serif;
  font-size: 18px;
  text-decoration: none;
  z-index: 2;
}
.track-title:hover{
    transition: all .2s;
    transform: scale(1.006);
    filter: drop-shadow(0 0 7px black);
}

.feed-icons {
  display: flex;
  z-index: 2;
}
.like-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 5px 0 20px;
}
.like-btn-image{
  width: 30px;
  height: 30px;
  filter: drop-shadow(0 0 5px black)
}
.like-btn-image:hover{
  transition: all .2s;
  transform: scale(1.04);
  filter: drop-shadow(0 0 7px black);
}
.like-count {
  color: white;
  font-size: 16px;
  font-family: 'Poppins-SemiBold', sans-serif;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 1);
}
.comment-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 0;
}
.comment-btn-image {
  width: 28px;
  height: 28px;
  filter: drop-shadow(0 0 5px black)
}
.comment-btn-image:hover{
  transition: all .2s;
  transform: scale(1.04);
  filter: drop-shadow(0 0 7px black);
}
.comment-count {
  color: white;
  font-size: 16px;
  font-family: 'Poppins-SemiBold', sans-serif;
  padding-left: 4px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 1);
}
.btn-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.music-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 0 0 0; /* Ajusta el padding para la sección de música */
}
.playback-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.control-btn {
  border: none;
  cursor: pointer;
  background: none;
  border: none;
  padding: 10px 6px 0px 0px;
  z-index: 2;
}
.control-btn img {
  width: 70px;
  height: 70px;
  filter: drop-shadow(0 0 5px black)
}
.control-btn img:hover {
  transition: all .1s ;
  transform: scale(1.02);
  filter: drop-shadow(0 0 10px black)
}
.play-count-container {
  display: flex;
  align-items: center;
}
.plays-icon {
  width: 12px; 
  height: 12px; 
  margin-right: 3px;
  filter: drop-shadow(0 0 10px black);
  z-index: 2;
}
.plays-count {
  color: white;
  font-size: 13px;
  padding: 0px 8px 0px 0;
  font-family: 'Poppins-Semibold', sans-serif;
  z-index: 2;
}

.waveform-container {
  flex-grow: 1;
  position: relative;
  width: 100%;
  height: 50px; /* Adjust as per your waveform component */
  padding: 0px 12px 25px 0;
  z-index: 2;
}
.waveform {
  filter: drop-shadow(0 0 5px black);
}
.waveform:hover {
    transform: scale(1.001);
}
.current-time, .total-time {
  position: absolute;
  color: white;
  font-family: 'Poppins', sans-serif;
  font-size: 12px;
}
.current-time {
  left: 0;
  z-index: 3;
}
.total-time {
  right: 0;
  padding-right: 15px;
  z-index: 3;
}

.comment-input-container {
    width: 100%;
    width: calc(65% - 8vh); /* Ajusta esto según necesites */
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    padding: 10px 0 10px 0;
    flex-direction: row;
    box-sizing: border-box; /* Asegura que el padding no afecte la anchura */
}
.user-image {
    width: 40px; /* Tamaño de la imagen del usuario */
    height: 40px; /* Asegúrate de que la imagen sea circular, si lo deseas */
    border-radius: 50%; /* Hace la imagen circular */
    object-fit: cover; /* Asegura que la imagen se cubra correctamente */
    border: 3px solid #ccc;
    border-radius: 20px;
    filter: drop-shadow(1px 1px 2px rgb(67, 67, 67))
}
.comment-input-container input {
    flex-grow: 1;
    font-size: 13px;
    font-family: 'Raleway', sans-serif;
    margin-right: 10px;
    padding: 10px 0px 10px 10px;
    border: 3px solid #ccc;
    border-radius: 20px;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
}
.comment-input-container input:hover {
    transition: all .2s ;
    transform: scale(1.01);
}
.comment-input-container button {
    background-color: black;
    font-size: 14px;
    font-family: 'Raleway', sans-serif;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
}
.comment-input-container button:hover {
    transition: all .2s ;
    transform: scale(1.02);
}

</style>
