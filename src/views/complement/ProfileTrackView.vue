<template>
    <div class="section">
        <div class="account" v-if="!isUserLoggedIn">
            <button class="login-button" @click="goToSignIn">ACCEDE A TU CUENTA</button>
        </div>
        <div class="account" v-else > 
            <button class="profile-button" title="Ir a mi perfil" @click="goToProfile">IR A MI PERFIL</button>
        </div>
        <div class="section-title">
            TRACK INFO
        </div>
        <div class="account" v-if="!isUserLoggedIn">
            <button class="register-button" title="Ir al registro" @click="goToSignUp">REGISTRARME</button>
        </div>
        <div class="account" v-else >
            <button class="signout-button" title="Cerrar sesión" @click="signOut">CERRAR SESIÓN</button>
        </div>
    </div>
    <div class="track-section" v-if="track">
        <div v-if="authStore.currentUser">
            <div v-if="authStore.currentUser.role === 'superAdmin' || track.nickname === authStore.currentUser.nickname" class="edit-bio-container">
                <button class="delete-track-btn" @click="submitDeleteTrack">ELIMINAR TRACK</button>
            </div>
        </div>
        <div class="track-container">
            <ProfileTrackCard 
                :track="track"
                :comment_count="comments.length"
                @commentClicked="focusCommentInput"
            ></ProfileTrackCard>
        </div>
        <!-- Sección para enviar comentarios -->
        <div v-if="isUserLoggedIn" class="comment-input-container">
            <img :src="authStore.currentUser.photo_url" class="user-image" alt="User Image"/>
            <input type="text" ref="commentInput" v-model="newComment" placeholder="Escribe un comentario" />
            <button @click="submitComment">Enviar</button>
        </div>
        <!-- Sección para mostrar la descripción del track -->
        <div class="description-title">DESCRIPCIÓN DEL TRACK</div>
        <div class="description-section">
            <span class="description">{{ track.description }}</span>
        </div>
        <!-- Sección de comentarios existentes -->
        <div class="comment-title">COMENTARIOS</div>
        <div class="comments-section">
            <div class="comment" 
                v-for="comment in comments" 
                :key="comment.id">
                <router-link class="comment-user" :to="`/profile/${comment.nickname}`">{{ comment.nickname }}</router-link>
                <span class="comment-description">{{ comment.comment }}</span>
            </div>
        </div>
    </div>
    <div v-else>
        Track No Encontrado
    </div>
    <transition name="fade">
        <div v-if="errorMessage" class="error-popup">
            <div class="error-message">{{ errorMessage }}</div>
        </div>
    </transition>
</template>

<script setup>
import { onMounted, computed, watch, ref } from 'vue';
import { useRouter } from 'vue-router'
import { useTracksStore } from '../../store/tracksStore';
import { useAuthStore } from '../../store/authStore';
import ProfileTrackCard from '../../components/ProfileTrackCard.vue';

const emit = defineEmits(['commentAdded']);

const router = useRouter();
const authStore = useAuthStore();
const tracksStore = useTracksStore();
const track = ref(null);
const currentUser = ref(null);
const comments = ref([]);
const newComment = ref('');
const commentInput = ref(null);
const errorMessage = ref('');

// Computed para verificar si el usuario está logueado
const isUserLoggedIn = computed(() => !!authStore.currentUser);

onMounted(async () => {
    try {
        await tracksStore.fetchTrack();
        if (!tracksStore.currentTrack) {
            console.error("Track no encontrado");
            return;
        }
        track.value = tracksStore.currentTrack;
        await tracksStore.fetchAllCommentsByTrackId(track.value.id);
        comments.value = tracksStore.comments;

        if (authStore.currentUser) {
            await authStore.fetchUser();
            currentUser.value = authStore.currentUser;
        }
    } catch (error) {
        console.error("Error al cargar el track o comentarios:", error);
    }
});

watch(errorMessage, (newValue) => {
    if (newValue) {
            setTimeout(() => {
            errorMessage.value = '';
        }, 1500);
    }
});

const submitDeleteTrack = async () => {
    try {
        const confirmDelete = confirm(`¿Realmente quieres eliminar el track llamado: ${track.value.title}?`);
        if (!confirmDelete) {
            return;
        }
        if (currentUser.value.nickname === track.value.nickname || currentUser.value.role === "superAdmin") {
            console.log('Eliminando track.');
            await tracksStore.deleteTrack(track.value.id);
            if (tracksStore.errorMessage) {
                errorMessage.value = tracksStore.errorMessage;
            }
            router.push(`/${track.value.nickanme}`);
        }
    }
    catch (error) {
        errorMessage = tracksStore.errorMessage();
        console.error("Error al eliminar un track:", error);
    }
};

const focusCommentInput = () => {
    if (commentInput.value) {
        commentInput.value.focus();
    }
};

const submitComment = async () => {
    if (!newComment.value.trim()) {
        alert('El comentario no puede estar vacío.');
        return;
    }
    if (!isUserLoggedIn.value) {
        alert('Debes iniciar sesión para comentar.');
        return;
    }
    try {
        const commentData = { user_id: currentUser.value.id, comment: newComment.value };
        await tracksStore.addComment(track.value.id, commentData);
        if (tracksStore.comments) {
            comments.value.push({nickname: currentUser.value.nickname, comment: newComment.value});
            newComment.value = '';
            emit('commentAdded');
        }
    } catch (error) {
        console.error("Error al enviar el comentario:", error);
    }
};

const goToSignIn = () => {
    router.push("/signIn");
};

const goToSignUp = () => {
    router.push("/signUp");
};

const goToProfile = () => {
    router.push(`/${currentUser.nickanme}`);
};

const signOut = () => {
    authStore.signOut().then(() => {
        router.push("/");
    });
};

</script>

<style scoped>

.section{
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 40px;
    margin-bottom: 10px;
}
.section-title {
    justify-content: center;
    font-family: 'Anton', sans-serif;
    font-size: 70px;
    text-decoration: none;
    margin-top: -30px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}
.login-button {
    margin-right: 10px;
    margin-left: 50px;
    margin-bottom: 25px;
    background-color: black;
    font-size: 17px;
    font-family: 'Raleway', sans-serif;
    color: white;
    padding: 10px 30px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
}
.profile-button {
    margin-right: 10px;
    margin-left: 50px;
    margin-bottom: 25px;
    background-color: black;
    font-size: 17px;
    font-family: 'Raleway', sans-serif;
    color: white;
    padding: 10px 30px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
}
.register-button {
    margin-right: 50px;
    margin-left: 10px;
    margin-bottom: 25px;
    background-color: black;
    font-size: 17px;
    color: white;
    font-family: 'Raleway', sans-serif;
    padding: 10px 70px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
}
.signout-button {
    margin-right: 50px;
    margin-left: 10px;
    margin-bottom: 25px;
    background-color: black;
    font-size: 17px;
    font-family: 'Raleway', sans-serif;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
}
.login-button:hover {
    transition: all .5s;
    transform: scale(1.05);
    background-color: #333;
}
.register-button:hover {
    transition: all .5s;
    transform: scale(1.05);
    background-color: #333;
}
.profile-button:hover {
    transition: all .5s;
    transform: scale(1.05);
    background-color: #333;
}
.signout-button:hover {
    transition: all .5s;
    transform: scale(1.05);
    background-color: #681c1c;
}

.delete-track-btn {
    background-color: #ff2626;
    font-family: 'Raleway', sans-serif;
    font-size: 15px;
    letter-spacing: 0.05em;
    font-weight: bolder;
    color: rgb(0, 0, 0);
    padding: 10px 40px;
    margin-bottom: 5px;
    border: 3px solid #000000;
    border-radius: 10px;
    cursor: pointer;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
}
.delete-track-btn:hover {
    transition: all .5s;
    transform: scale(1.05);
}

.track-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
}
.track-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    z-index: 0;
}

.description-title {
    display: flex;
    position: right;
    font-family: 'Anton', sans-serif;
    font-size: 20px;
    margin-top: 20px;
    margin-bottom: 2px;
}
.description-section {
    width: 100%;
    width: calc(63% - 8vh); /* Ajusta esto según necesites */
    padding: 10px 20px 20px 20px;
    border: 1px solid #ccc;
    background-color: rgb(0, 0, 0);
    border-radius: 20px;
    margin-bottom: 10px;
}
.description {
    white-space: pre-wrap;
    padding: 10px 10px 0px 10px;
    display: flex;
    flex-direction: column;
    font-family: 'Poppins-SemiBold';
    font-weight: bold; /* Hace el nombre del usuario más notorio */
    font-size: 14px;
    color: #ffffff;
    margin-bottom: 2px;
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
    box-sizing: border-box;  /* Asegura que el padding no afecte la anchura */
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
    padding: 10px;
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

.comment-title {
    display: flex;
    position: right;
    font-family: 'Anton', sans-serif;
    font-size: 20px;
    margin-top: 10px;
    margin-bottom: 5px;
}
.comments-section {
    width: 100%;
    width: calc(63% - 8vh); /* Ajusta esto según necesites */
    padding: 10px 20px 20px 20px;
    border: 1px solid #ccc;
    background-color: rgb(0, 0, 0);
    border-radius: 20px;
    margin-bottom: 10px;
}
.comment {
    border-bottom: 2px solid #eee;
    padding: 10px 0px 15px 10px;
    display: flex;
    flex-direction: column;
    font-family: 'Poppins-SemiBold';
    font-weight: bold; /* Hace el nombre del usuario más notorio */
    font-size: 14px;
    color: #ffffff;
    margin-bottom: 2px;
}
.comment-user {
    text-decoration: none;
    color: #ffffff;
    font-family: 'Poppins-SemiBold';
    font-weight: bold; /* Hace el nombre del usuario más notorio */
    font-size: 14px;
    margin-bottom: 2px; /* Espacio entre el nombre del usuario y el comentario */
}
.comment-description {
    white-space: pre-wrap;
    font-family: 'Poppins';
    font-size: 15px;
    padding-left: 15px;
    color: #a8a8a8; 
}

.error-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    padding: 20px 20px;
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