<template>
    <div class="track-card" :style="{ backgroundImage: `url(${track.cover_url})` }">
        <div class="artist-genre-section">
            <div class="track-artist" @click="goToArtistTrackProfile">{{ track.nickname }}</div>
            <div class="track-genre"> #{{ track.genre }}</div>
        </div>
        <div class="title-feed-section">
            <template v-if="track && track.id">
                <div class="track-title">{{ track.title }}</div>
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
            <div class="waveform-container">
                <div ref="waveformRef" class="waveform"></div>
                <span class="current-time">{{ currentTime }}</span>
                <span class="total-time">{{ totalTime }}</span>
            </div>
        </div>
        <div class="download-section">
            <!-- Botón de Descarga -->
            <button
                class="download-btn"
                :class="{ 'btn-disabled': !isUserLoggedIn || !userHasCommented || !userHasLiked }"
                src="../assets/download-icon.png"
                @click="handleDownloadBtn"
            >
                <img class="download-btn-image" src="../assets/download-icon.png" alt="Download" />
            </button>
        </div>
    </div>
    <transition name="fade">
        <div v-if="errorMessage" class="error-popup">
            <div class="error-message">{{ errorMessage }}</div>
        </div>
    </transition>
</template>

<script setup>
import { useRouter } from "vue-router";
import { onMounted, defineEmits, ref, watch, computed } from 'vue'
import { useAuthStore } from '../store/authStore';
import { useTracksStore } from "../store/tracksStore";
import WaveSurfer from 'wavesurfer.js';

const props = defineProps({
    track: Object,
    comment_count: Number
});

const emit = defineEmits(['commentClicked']);

const router = useRouter();
const errorMessage = ref('');
const waveformRef = ref(null);
let wavesurfer = null;
const isReady = ref(false); // Nuevo estado para controlar la disponibilidad de la reproducción
const isPlaying = ref(false);
const playCount = ref(props.track.plays || 0);
const playCountAdded = ref(false);

const currentTime = ref('00:00');
const totalTime = ref('00:00');

const authStore = useAuthStore();
const tracksStore = useTracksStore();
const like_count = ref(props.track.like_count || 0);
const userHasLiked = ref(false);
const userHasCommented = ref(false);

// Computed para verificar si el usuario está logueado
const isUserLoggedIn = computed(() => !!authStore.currentUser);

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
        errorMessage.value = 'Debes iniciar sesión para dar like.';
        return;
    }
    if (userHasLiked.value) {
        errorMessage.value = '¡Ya has dado like a este track!';
        return;
    }
    else {
        like_count.value++;
        tracksStore.currentTrack.like_count++;
        userHasLiked.value = true;
        tracksStore.addLike(props.track.id, authStore.currentUser.id);
    }
}

const handleCommentBtn = () => {
    if (!isUserLoggedIn.value) {
        errorMessage.value = 'Debes iniciar sesión para comentar.';
        return;
    }
    // Emitir un evento para que el componente padre lo escuche
    emit('commentClicked');
}

const handleDownloadBtn = () => {
    if (!isUserLoggedIn.value) {
        errorMessage.value = 'Debes iniciar sesión para descargar el track.';
        return;
    } 
    else if (!userHasLiked.value || !userHasCommented.value) {
        errorMessage.value = 'Debes dar me gusta y comentar para descargar el track.';
        return;
    }
    downloadTrack();
}

const downloadFileName = computed(() => {
    if (!props.track.title) return '';
    return `${props.track.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;
});

const downloadTrack = () => {
    const link = document.createElement('a');
    link.href = props.track.audio_url; // Asegúrate de que la URL está correctamente especificada
    link.download = downloadFileName.value || 'download'; // Utiliza un nombre de archivo seguro
    link.target = '_blank'; // Esto abrirá la descarga en una nueva pestaña
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const formatTime = time => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
};

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
            tracksStore.currentTrack.plays++;
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
    };
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

watch(() => props.comment_count, (newValue, oldValue) => {
    if (newValue > oldValue) {
        userHasCommented.value = true;
    }
});

const togglePlayback = () => {
    if (!isReady.value) return;
    wavesurfer.playPause();
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



</script>

<style scoped>
.track-card {
    position: relative;
    background-color: black;
    padding: 20px 40px 0px 40px;
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
    transform: scale(1.02);
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
    transform: scale(1.005);
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
.like-btn-image {
    width: 30px;
    height: 30px;
    filter: drop-shadow(0 0 5px black);
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

.download-section {
    display: flex;
    justify-content: center;
    width: 100%;
    align-items: center;
    padding: 5px 0 0 0; /* Ajusta el padding para la sección de música */
}
.download-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0px 0 0 0;
    z-index: 3;
}
.download-btn-image{
    width: 130px;
    height: 28px;
    filter: drop-shadow(0 0 10px black);
}
.download-btn-image:hover {
    transition: all .5s;
    transform: scale(1.05);
    box-shadow: 3px 3px 10px rgba(0,0,0,1);
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
    margin-top: 10px;
}
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
    opacity: 0;
}

</style>
