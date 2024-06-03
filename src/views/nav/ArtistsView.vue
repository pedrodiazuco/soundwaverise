<template>
  <div class="user-section">
  <div class="account" v-if="!isUserLoggedIn">
          <button class="login-button" @click="goToSignIn">ACCEDE A TU CUENTA</button>
  </div>
  <div class="account" v-else > 
          <button class="profile-button" title="Ir a mi perfil" @click="goToMyProfile">IR A MI PERFIL</button>
  </div>
  <div class="section-title">
          ARTISTAS
  </div>
  <div class="account" v-if="!isUserLoggedIn">
          <button class="register-button" @click="goToSignUp">REGISTRARME</button>
  </div>
  <div class="account" v-else >
          <button class="signout-button" @click="signOut">CERRAR SESIÓN</button>
  </div>
  </div>
  <div class="artists-section">
    <div class="filter-container">
      <label for="province-select" class="filter-label">FILTRAR POR PROVINCIA:</label>
      <select v-model="selectedProvince" class="province-select">
        <option value="">Todas las provincias</option>
        <option v-for="province in provinces" :key="province" :value="province">
          {{ province }}
        </option>
      </select>
    </div>
    <transition-group name="fade" tag="div" class="artists-container" appear>
      <div v-for="user in filteredUsers" :key="user.id" @click="goToProfile(user.nickname)" class="artist-profile" title="Ir al perfil">
        <div class="nickname">{{ user.nickname }}</div>
        <img :src="user.photo_url" class="artist-photo" alt="Foto del Artista">
        <div class="artist-info">
          <div class="email">{{ user.email }}</div>
          <div class="province">{{ user.province }}</div>
        </div>
      </div>
      <div v-if="filteredUsers.length === 0">
          <p>No se encuentran usuarios.</p>
      </div>
    </transition-group>
  </div>

  <transition name="fade">
    <div v-if="errorMessage" class="error-popup">
            <div class="error-message">{{ errorMessage }}</div>
    </div>
  </transition>
</template>

<script setup>
  import { onMounted, computed, ref } from 'vue';
  import { useUsersStore } from '../../store/usersStore';
  import { useAuthStore } from '../../store/authStore';
  import { useRouter } from 'vue-router';

  const usersStore = useUsersStore();
  const authStore = useAuthStore();
  const router = useRouter();
  const errorMessage = ref('');
  const selectedProvince = ref('');
  const provinces = computed(() => {
  // Asumiendo que `usersStore.users` contiene una lista de todos los usuarios con su provincia
  const allProvinces = usersStore.users.map(user => user.province);
  return Array.from(new Set(allProvinces));
  });

  const filteredUsers = computed(() => {
    return usersStore.users.filter(user => {
      return selectedProvince.value === '' || user.province === selectedProvince.value;
    });
  });
  // Computed para verificar si el usuario está logueado
  const isUserLoggedIn = computed(() => !!authStore.currentUser);

  onMounted(async () => {
      await usersStore.fetchUsers();
  });

  const goToProfile = (nickname) => {
    if (authStore.currentUser) {
      if (nickname === authStore.currentUser.nickname) {
        router.push(`/${authStore.currentUser.nickname}`);
      }
      else {
      router.push(`/profile/${nickname}`);
      }
    }
    else {
      router.push(`/profile/${nickname}`);
    }
  };


  const goToSignIn = () => {
    router.push("/signIn");
  };

  const goToSignUp = () => {
    router.push("/signUp");
  };

  const goToMyProfile = () => {
    router.push(`/${authStore.currentUser.nickname}`);
  };

  const signOut = () => {
    authStore.signOut().then(() => {
      router.push("/");
    });
  };
  
</script>


<style scoped>
.user-section{
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 40px;
}
.section-title {
        justify-content: center;
        text-align: center;
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
        background-color: #333;
}
.register-button:hover {
        background-color: #333;
}
.profile-button:hover {
        background-color: #333;
}
.signout-button:hover {
        background-color: #681c1c;
}


.artists-section {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.filter-container {
  display: flex;
  flex-direction: inline;
  align-items: center; /* Centra los elementos verticalmente */
  background-color: black;
  padding: 4px 20px;
  margin-bottom: 10px; /* Espacio después del filtro, antes de la lista de tracks */
  border-radius: 5px; /* Bordes redondeados para el contenedor del filtro */
  width: auto;
}
.filter-label {
  color: white;
  margin-bottom: 5px; /* Espacio entre la etiqueta y el selector */
  font-size: 16px; /* Ajusta según el diseño */
  padding: 5px 0px 0 0;
  font-family: 'Raleway-Medium', sans-serif;
  font-weight: 500;
}
.province-select {
  color: white; /* Texto blanco para el select */
  background-color: black; /* Fondo negro para el select */
  border: 1px solid rgb(0, 0, 0); /* Borde blanco para hacerlo visible en el fondo negro */
  outline: none;
  border-radius: 10px;
  padding: 5px 0px; /* Padding para hacer más grande el área clickeable */
  cursor: pointer; /* Cambia el cursor a una mano para indicar que es seleccionable */
  font-size: 16px;
  font-family: 'Raleway-Medium', sans-serif;
  text-transform: uppercase;
  width: auto;
}

.artists-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 60px;
  padding: 10px 10px 10px 10px;
}

.artist-profile {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 210px;  /* Ajusta según necesidad */
  border-width: 4px;
  border-style: solid;
  border-radius: 20px;
  background: radial-gradient(transparent, black 70%);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.artist-profile:hover {
  transition: all .2s;
  transform: scale(1.02);
}

.artist-photo {
  width: 150px;
  height: 150px;
  border-radius: 10%;
  border-style: solid;
  border-color: white;
  object-fit: cover;
}

.artist-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 5px 20px 10px 20px;
} 
.nickname {
  margin: 8px 0 4px 0;
  color: rgb(255, 255, 255);
  font-size: 20px;
  font-family: 'Poppins-SemiBold', sans-serif;
}
.email {
  color: rgb(255, 255, 255);
  font-size: 13px;
  font-family: 'Poppins', sans-serif;
  font-style: italic;
}
.province {
  color: rgb(255, 255, 255);
  font-size: 14px;
  font-family: 'Poppins', sans-serif;
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

.fade-enter-active {
opacity: 0;
}

.fade-enter-to {
opacity: 1;
}


</style>