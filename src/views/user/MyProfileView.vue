<template>
    <div class="user-section">
      <div class="account" v-if="!isUserLoggedIn">
              <button class="login-button" @click="goToSignIn">ACCEDE A TU CUENTA</button>
      </div>
      <div class="account" v-else >
              <button class="upload-track-button" title="Subir un track" @click="uploadTrack">SUBIR UN TRACK</button>
      </div>
      <div class="section-title">
              MI PERFIL
      </div>
      <div class="account" v-if="!isUserLoggedIn">
              <button class="register-button" @click="goToSignUp">REGISTRARME</button>
      </div>
      <div class="account" v-else >
              <button class="signout-button" @click="signOut">CERRAR SESIÓN</button>
      </div>
    </div>
    <div v-if="currentUser">
      <div  class="user-profile-card" :style="{ backgroundImage: `url(${imageUrl})` }">
        <div class="user-info">
            <img :src="imageUrl" class="artist-photo" alt="Foto del Artista">
            <div class="user-details">
                <div class="nickname">{{ currentUser.nickname }}</div>
                <div class="email">{{ currentUser.email }}</div>
                <div class="province">{{ currentUser.province }}</div>
            </div>
            <div class="divider"></div>
            <div class="biography">
                <div class="biography-title">Biografía</div>
                <div class="biography-content">{{ currentUser.biography }}</div>
            </div>
        </div>
      </div>
      <div class="edit-bio-container">
        <button class="edit-bio-btn" @click="goToSetProfile">EDITAR PERFIL</button>
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
  import { ref, onMounted, computed, watch } from 'vue';
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '../../store/authStore';
  import { useTracksStore } from '../../store/tracksStore';
  import TopTracksListByUser from '../../components/TopTracksListByUser.vue';
  import RecentTracksListByUser from '../../components/RecentTracksListByUser.vue';

  const router = useRouter();
  const authStore = useAuthStore();
  const tracksStore = useTracksStore();
  const currentUser = ref(null);
  const tracks = ref([]);
  const imageUrl = ref(''); // Ref para la URL de la imagen actualizada
  const errorMessage = ref('');

  // Computed para verificar si el usuario está logueado
  const isUserLoggedIn = computed(() => !!authStore.currentUser);

  onMounted(async () => {
    try {
      await authStore.fetchUser();
      if (authStore.currentUser) {
        currentUser.value = authStore.currentUser;
      }
      await tracksStore.fetchAllTrackskByUserId(currentUser.value.id);
      if (!tracksStore.tracks) {
        console.error("El usuario no tiene tracks");
      }
      tracks.value = tracksStore.tracks;
    } 
    catch (error) {
      errorMessage.value = '¡Debes iniciar sesión para acceder a tu perfil!'
    }
  });

  // Actualiza la URL de la imagen cada vez que cambie user.photo_url
  watch(() => currentUser.value?.photo_url, (newValue) => {
    imageUrl.value = `${newValue}?timestamp=${new Date().getTime()}`;
  }, { immediate: true });

  const goToSignIn = () => {
    router.push("/signIn");
  };

  const uploadTrack = async () => {
    router.push("/uploadTrack");
  };

  const goToSignUp = () => {
    router.push("/signUp");
  };

  const signOut = () => {
    authStore.signOut().then(() => {
    router.push("/");
    });
  };

  const goToSetProfile = () => {
    router.push(`/setProfile/${currentUser.value.nickname}`);
  };

</script>


<style scoped>
.user-section{
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 40px;
  margin-bottom: 0px;
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
.upload-track-button {
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
  font-family: 'Raleway', sans-serif;
  color: white;
  padding: 10px 70px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
}
.signout-button {
  margin-right: 50px;
  margin-left: 30px;
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
.upload-track-button:hover {
    transition: all .5s;
    transform: scale(1.05);
    background-color: #216723;
}
.signout-button:hover {
    transition: all .5s;
    transform: scale(1.05);
    background-color: #681c1c;
}

.user-profile-card {
  display: flex;
  position: relative;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: auto;
  min-width: 40%;
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
  align-items: column;
  text-shadow: 0px 0px 6px rgba(0, 0, 0, 1);
  z-index: 2;
}

.artist-photo {
  width: 150px;
  height: 150px;
  border-radius: 3%;
  border: 3px solid #ffffff;
  margin-right: 20px;
  margin-left: 0px;
  flex-shrink: 0;
  align-self: center;
}

.user-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 0 20px 0 5px;
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
  font-size: 14px;
  font-family: 'Poppins', sans-serif;
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
  width: 3px;
  background-color: #ffffff;
  border-radius: 10px;
  margin: 0 60px;
  height: auto;
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
  text-align: justify;
}

.edit-bio-container {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 10px;
}
.edit-bio-btn {
  background-color: black;
  font-size: 17px;
  color: white;
  padding: 10px 40px;
  margin-bottom: 20px;
  border: none;
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