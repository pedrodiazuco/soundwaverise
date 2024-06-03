<template>
    <div>
      <div class="section">
        <div class="account" v-if="!isUserLoggedIn">
            <button class="login-button" @click="goToSignIn">ACCEDE A TU CUENTA</button>
        </div>
        <div class="account" v-else > 
          <button class="profile-button" title="Ir a mi perfil" @click="goToProfile">IR A MI PERFIL</button>
        </div>
        <div class="section-title">
            TRACKS RANKING
        </div>
        <div class="account" v-if="!isUserLoggedIn">
            <button class="register-button" @click="goToSignUp">REGISTRARME</button>
        </div>
        <div class="account" v-else >
          <button class="signout-button" @click="signOut">CERRAR SESIÓN</button>
        </div>
      </div>
      <RankingTrackList></RankingTrackList>
    </div>
</template>
    
<script setup>
import { useRouter } from "vue-router";
import { computed } from "vue";
import { useAuthStore } from "../../store/authStore";
import RankingTrackList from "../../components/RankingTracksList.vue";

const router = useRouter();
const authStore = useAuthStore();

// Computed para verificar si el usuario está logueado
const isUserLoggedIn = computed(() => !!authStore.currentUser);

const goToSignIn = () => {
  router.push("/signIn");
};

const goToSignUp = () => {
  router.push("/signUp");
};

const goToProfile = () => {
  router.push(`/${authStore.currentUser.id}`);
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
  padding: 10px 60px;
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

</style>
