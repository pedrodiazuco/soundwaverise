<template>
        <div class="user-section">
        <div class="account" v-if="!isUserLoggedIn">
                <button class="login-button" @click="goToSignIn">ACCEDE A TU CUENTA</button>
        </div>
        <div class="account" v-else > 
                <button class="profile-button" title="Ir a mi perfil" @click="goToProfile">IR A MI PERFIL</button>
        </div>
        <div class="section-title">
                PERFIL DE ARTISTA
        </div>
        <div class="account" v-if="!isUserLoggedIn">
                <button class="register-button" @click="goToSignUp">REGISTRARME</button>
        </div>
        <div class="account" v-else >
                <button class="signout-button" @click="signOut">CERRAR SESIÓN</button>
        </div>
        </div>
        <div v-if="user">
                <div v-if="authStore.currentUser">
                        <div v-if="authStore.currentUser.role === 'superAdmin' && user.role === 'superAdmin'" class="superAdmin-section">
                                <div class="superAdmin-info"> {{ user.nickname }} TAMBIÉN ES USUARIO ADMINISTRADOR</div>
                        </div>
                        <div v-if="authStore.currentUser.role === 'superAdmin' && user.role !== 'superAdmin'" class="superAdmin-section">
                                <button class="delete-user-btn" @click="submitDeleteUser">ELIMINAR USUARIO</button>
                                <button class="set-superadmin-btn" @click="submitSetSuperAdmin">HACER SUPERADMIN</button>
                        </div>
                </div>
                <div class="user-profile-card" :style="{ backgroundImage: `url(${user.photo_url})` }">
                        <div class="user-info">
                                <img :src="user.photo_url" class="artist-photo" alt="Foto del Artista">
                                <div class="user-details">
                                        <div class="nickname">{{ user.nickname }}</div>
                                        <div class="email">{{ user.email }}</div>
                                        <div class="province">{{ user.province }}</div>
                                </div>
                                <div class="divider"></div>
                                <div class="biography">
                                        <div class="biography-title">Biografía</div>
                                        <div class="biography-content">{{ user.biography }}</div>
                                </div>
                        </div>
                </div>
                <div v-if="authStore.currentUser">
                        <div v-if="authStore.currentUser.role === 'superAdmin' && user.role !== 'superAdmin'" class="edit-bio-container">
                                <button class="edit-bio-btn" @click="goToSetProfile">EDITAR PERFIL</button>
                        </div>
                </div>
        </div>
        <div v-else>
                <p>Usuario no encontrado o datos no disponibles.</p>
        </div>
        <div class="topTrackList-Section">
                <TopTracksListByUser
                :tracks="tracks"/>
        </div>
        <div class="recentTrackList-Section">
                <RecentTracksListByUser
                :tracks="tracks"/>
        </div>
        <transition name="fade">
        <div v-if="errorMessage" class="error-popup">
                <div class="error-message">{{ errorMessage }}</div>
        </div>
        </transition>
</template>

<script setup>

import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../store/authStore';
import { useUsersStore } from '../../store/usersStore';
import { useTracksStore } from '../../store/tracksStore';
import TopTracksListByUser from '../../components/TopTracksListByUser.vue';
import RecentTracksListByUser from '../../components/RecentTracksListByUser.vue';

const route = useRoute();
const router = useRouter();
const usersStore = useUsersStore();
const authStore = useAuthStore();
const tracksStore = useTracksStore();
const user = ref(null);
const tracks = ref([]);
const imageUrl = ref(''); // Ref para la URL de la imagen actualizada
const errorMessage = ref('');

// Computed para verificar si el usuario está logueado
const isUserLoggedIn = computed(() => !!authStore.currentUser);

// Función para actualizar la URL de la imagen con un timestamp para evitar caché
const updateImageSrc = () => {
        if (user.value && user.value.photo_url) {
                imageUrl.value = `${user.value.photo_url}?timestamp=${new Date().getTime()}`;
        }
};

onMounted(async () => {
        try {
                await usersStore.fetchUser(route.params.nickname);
                if (!usersStore.user) {
                        console.error("Usuario no encontrado.");
                        return;
                }
                user.value = usersStore.user;
                updateImageSrc();
                await tracksStore.fetchAllTrackskByUserId(user.value.id);
                if (!tracksStore.tracks) {
                        console.error("El usuario no tiene tracks");
                }
                tracks.value = tracksStore.tracks;
        } catch (error) {
                console.error("Error al cargar el usuario.", error);
        }
});

// Observador para detectar cambios en la URL original y actualizar la imagen
watch(() => user.value ? user.value.photo_url : '', (newVal, oldVal) => {
        if (newVal !== oldVal) {
                updateImageSrc();
        }
});

const submitDeleteUser = async () => {
        try {
                const confirmDelete = confirm(`¿Realmente quieres eliminar el usuario llamado: ${user.value.nickname}?`);
                if (!confirmDelete) {
                        return;
                }
                if (authStore.currentUser.role === "superAdmin") {
                        console.log('Eliminando usuario.');
                        await usersStore.deleteUser(user.value.nickname);
                        if (usersStore.errorMessage) {
                        errorMessage.value = usersStore.errorMessage;
                }
                router.push(`/artists`);
                }
        } 
        catch (error) {
                errorMessage.value = usersStore.errorMessage;
                console.error("Error al eliminar un usuario:", error);
        }
};

const submitSetSuperAdmin = async () => {
        try {
                const confirmSetSuperAdmin = confirm(`¿Realmente quieres hacer auperadministrador el usuario: ${user.value.nickname}?`);
                if (!confirmSetSuperAdmin) {
                        return;
                }
                if (authStore.currentUser.role === "superAdmin") {
                        console.log('Actualizando el rol del usuario a superAdmin.');
                        await usersStore.setSuperAdmin(user.value.nickname);
                        if (usersStore.errorMessage) {
                        errorMessage.value = usersStore.errorMessage;
                        }
                        else {
                                await usersStore.fetchUser(user.value.nickname);
                                console.log('Usuario actualizado a superAdmin');
                                router.push(`/profile/${user.value.nickname}`).then(() => {
                                        window.location.reload();
                                });
                                console.log('Página refrescada.');
                        }
                } else {
                        console.log('No tienes permisos para cambiar el rol a superAdmin');
                }
        }
        catch (error) {
                errorMessage.value = usersStore.errorMessage;
                console.error("Error al eliminar un usuario:", error);
        }
}

const goToSignIn = () => {
        router.push("/signIn");
};

const goToSignUp = () => {
        router.push("/signUp");
};

const goToProfile = () => {
        router.push(`/${authStore.currentUser.nickname}`);
};

const signOut = () => {
        authStore.signOut().then(() => {
                router.push("/");
        });
};

const goToSetProfile = () => {
        router.push(`/setProfile/${user.value.nickname}`);
};



</script>

<style scoped>
.user-section{
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

.superAdmin-section {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        width: 100%;
        gap: 20px;
}
.superAdmin-info {
        font-family: 'Raleway', sans-serif;
        font-size: 20px;
        letter-spacing: 0.05em;
        font-weight: bolder;
        color: #3fff26;
        background-color: #000000;
        text-transform: uppercase;
        border: 3px solid #000000;
        padding: 5px;
        margin-bottom: 20px;
}
.delete-user-btn {
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
.delete-user-btn:hover {
        transition: all .5s;
        transform: scale(1.05);
}
.set-superadmin-btn {
        background-color: #3fff26;
        font-family: 'Raleway', sans-serif;
        font-size: 15px;
        letter-spacing: 0.05em;
        font-weight: bolder;
        color: rgb(0, 0, 0);
        padding: 10px 35px;
        margin-bottom: 5px;
        border: 3px solid #000000;
        border-radius: 10px;
        cursor: pointer;
        box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
}
.set-superadmin-btn:hover {
        transition: all .5s;
        transform: scale(1.05);
}

.user-profile-card {
        display: flex;
        position: relative;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        width: auto; /* Ajusta el ancho según el contenido */
        min-width: 40%; /* Establece un mínimo, ajustable según necesidades */
        max-width: 75%;
        margin: auto;
        background-size: cover;
        background-position: center;
        border-width: 2px;
        border-style: solid;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        z-index: 0;
}
.user-profile-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(transparent, black 70%);
        z-index: 1;
}

.user-info {
        display: flex;
        flex-direction: row;
        align-items: column; /* Centrar los elementos verticalmente */
        text-shadow: 0px 0px 6px rgba(0, 0, 0, 1);
        z-index: 2;
}

.artist-photo {
        width: 150px;
        height: 150px;
        border-radius: 3%;
        border: 3px solid #ffffff; /* Borde negro sólido */
        margin-right: 20px;
        margin-left: 20px;
        flex-shrink: 0;
        align-self: center;
}

.user-details {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        padding: 0 10px 0 5px;
        flex-grow: 1;
        min-width: 0;
        justify-content: center; 
}
.nickname {
        color: rgb(255, 255, 255);
        padding-top: 10px;
        font-size: 16px;
        font-family: 'Poppins-SemiBold', sans-serif;
        white-space: normal;
        overflow-wrap: break-word;
}
.email {
        color: rgb(255, 255, 255);
        font-size: 16px;
        font-family: 'Poppins-SemiBold', sans-serif;
        white-space: normal;
        overflow-wrap: break-word;
}
.province {
        color: rgb(255, 255, 255);
        padding-top: 60px;
        padding-bottom: 10px;
        font-size: 16px;
        font-family: 'Poppins-SemiBold', sans-serif;
        white-space: normal;
        overflow-wrap: break-word;
}

.divider {
        align-self: stretch;
        width: 3px;
        height: 100%;
        background-color: #ffffff;
        border-radius: 10px;
        margin: 0 60px; /* Margen a los lados del divisor */
        height: auto; /* Ajusta la altura automáticamente al contenido */
}

.biography {
        display: flex;
        flex-direction: column;
        flex-grow: 3;
        padding: 10px 0px 10px 10px;
        text-align: justify;
        overflow: hidden;
}
.biography-title {
        color: rgb(255, 255, 255);
        font-size: 16px;
        font-family: 'Poppins-SemiBold', sans-serif;
}
.biography-content {
        white-space: pre-wrap;
        overflow: auto;
        color: rgb(255, 255, 255);
        font-size: 14px;
        font-family: 'Poppins', sans-serif;
        text-align: justify; /* Justifica el texto de la biografía */
}

.edit-bio-container {
        display: flex;
        justify-content: center;
        width: 100%;
        margin-top: 5px;
}
.edit-bio-btn {
        background-color: #3fff26;
        font-family: 'Raleway', sans-serif;
        font-size: 15px;
        letter-spacing: 0.05em;
        font-weight: bolder;
        color: rgb(0, 0, 0);
        padding: 10px 40px;
        margin-bottom: 20px;
        border: 3px solid #000000;
        border-radius: 10px;
        cursor: pointer;
        box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
}
.edit-bio-btn:hover {
        background-color: #548c32;
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