<template>
    <!-- Sección actual -->
    <div class="section">
        <div class="question-container" v-if="!isUserLoggedIn">
            <button class="login-button" @click="goToSignIn">ACCEDE A TU CUENTA</button>
        </div>
        <div class="account" v-else>
            <button class="profile-button" title="Ir a mi perfil" @click="goToProfile">IR A MI PERFIL</button>
        </div>
        <div class="section-title">
            ¿QUIENES SOMOS?
        </div>
        <div class="account" v-if="!isUserLoggedIn">
            <button class="register-button" @click="goToSignUp">REGISTRARME</button>
        </div>
        <div class="account" v-else>
            <button class="signout-button" @click="signOut">CERRAR SESIÓN</button>
        </div>
    </div>
    <div class="about-container">
        <div class="about-item">
            <div class="description">
                Bienvenido a SOUND WAVE RISE, <br>
                el destino definitivo para descubrir y apoyar el talento emergente en la industria musical. <br><br>

                En SOUND WAVE RISE, estamos dedicados a proporcionar una plataforma
                donde los artistas emergentes puedan mostrar sus producciones al mundo y conectar con una audiencia
                global. <br>

                Nuestra misión es simple y poderosa, queremos ser el trampolín que lance las carreras de los próximos
                grandes nombres en la música.<br><br>

                Únete a nosotros y sé parte de una comunidad vibrante de creadores y amantes de la música.
                ¡Juntos, podemos construir un futuro donde el talento verdadero y la pasión por la música sean
                celebrados y apoyados!
            </div>
        </div>
        <div class="about-item">
            <div class="description-down">
                PARA CUALQUIER DUDA, CONTACTA CON NOSOTROS <br>
                sounwaverise@gmail.com
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { computed } from "vue";
import { useAuthStore } from "../../store/authStore";
const router = useRouter();
const authStore = useAuthStore();

const isUserLoggedIn = computed(() => !!authStore.currentUser);

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

</script>

<style scoped>
.section {
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
    font-family: 'Raleway', sans-serif;
    color: white;
    padding: 10px 60px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
}

.signout-button {
    margin-right: 50px;
    margin-left: 12px;
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

.about-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
    width: 100%;
    padding-top: 10px;
}

.about-item {
    text-align: center;
    display: block;
    width: calc(70% - 8vh);
    margin: 10px 0;
}

.description {
    font-size: 25px;
    font-family: 'Poppins', sans-serif;
    font-style: italic;
    font-weight: bolder;
}

.description-down {
    font-size: 20px;
    font-family: 'Poppins', sans-serif;
    font-style: italic;
}
</style>