<template>
    <div class="section">
        <div class="question-container" v-if="!isUserLoggedIn">
            <button class="login-button" @click="goToSignIn">ACCEDE A TU CUENTA</button>
        </div>
        <div class="account" v-else > 
            <button class="profile-button" title="Ir a mi perfil" @click="goToProfile">IR A MI PERFIL</button>
        </div>
        <div class="section-title">
            PREGUNTAS FRECUENTES
        </div>
        <div class="account" v-if="!isUserLoggedIn">
            <button class="register-button" @click="goToSignUp">REGISTRARME</button>
        </div>
        <div class="account" v-else >
            <button class="signout-button" @click="signOut">CERRAR SESIÓN</button>
        </div>
    </div>
    <div class="faq-container">
        <div class="faq-item">
            <div class="faq-question">
                ¿Es posible descargar los tracks?
            </div>
            <div class="faq-answer">
                Si, para ello primero debes estar resgistrado, si ya está registrado
                inicia sesión. Una vez hecho lo anterior, debes irte al perfil de la canción, dar like y comentar.
                Finalmente, verás habilitado el botón de descarga.
            </div>
        </div>
        <div class="faq-item">
            <div class="faq-question">
                ¿Cómo contacto con el artista?
            </div>
            <div class="faq-answer">
                El artista al registrarse ha debido de poner su correo electrónico,
                escribiéndole un correo podrás contactar con él. También, en la biografía
                de su perfil puede que el usuario haya registrado su número de teléfono o redes sociales.
            </div>
        </div>
        <div class="faq-item">
            <div class="faq-question">
                ¿Puedo registrarme en la plataforma?
            </div>
            <div class="faq-answer">
                Si, todo el usuario que quiera podrá registrarse y tener acceso a nuestros
                servicios de forma gratuita.
            </div>
        </div>
        <div class="faq-item">
            <div class="faq-question">
                ¿Hay que pagar mensualidad por estar registrado?
            </div>
            <div class="faq-answer">
                En absoluto, todos nuestros servicios son gratuitos.
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

// Computed para verificar si el usuario está logueado
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

.faq-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
    width: 100%;
    padding-top: 10px;
}

.faq-item {
    text-align: center;
    display: block;
    width: calc(70% - 8vh); /* Ajusta esto según necesites */
    margin: 10px 0;
}

.faq-question {
    font-size: 30px;
    font-family: 'Poppins', sans-serif;
    font-style: italic;
    text-transform: uppercase;
    font-weight: bolder;
}

.faq-answer {
    font-size: 20px;
    font-family: 'Poppins', sans-serif;
    font-style: italic;
}



</style>