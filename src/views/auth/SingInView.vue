<template>
    <div class="signIn-section">
        <div class="signIn-section-title">
            ELEVA TU SONIDO
        </div>
    </div>
    <div class="signIn-section-subtitle">
            Descubre y comparte música con el mundo.
    </div>
    <div class="signIn-container">
        <div class="signIn-box">
        <div class="signIn-title">
            ----- INICIO DE USUARIO -----
        </div>
        <form @submit.prevent="signInSubmit">
            <div class="input-title-info">Nombre de Artista</div>
            <div class="form-group">
                <input type="email" id="email" v-model.trim="email" @blur="validateEmail" :class="{'valid-input': emailValid}" placeholder="Introduzca su email">
            </div>
            <div class="input-title-info">Contraseña</div>
            <div class="form-group">
                <input type="password" id="password" v-model="password" @blur="validatePassword" :class="{'valid-input': passwordValid}" placeholder="Introduce su contraseña">
            </div>
            <button 
                class="button-signIn"
                :class="{ 'btn-disabled': !isFormValid }" 
                type="submit" 
            >
                    Acceder
            </button>
            <div class="extra-info">
                ¿No tienes cuenta? <router-link to="/signUp" class="link">Regístrate</router-link>
            </div>
        </form>
        </div>
    </div>
    <transition name="fade">
        <div v-if="errorMessage" class="error-popup">
            <div class="error-message">{{ errorMessage }}</div>
        </div>
    </transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'vue-router';


const authStore = useAuthStore();
const router = useRouter();
const errorMessage = ref('');

const email = ref('');
const password = ref('');

const emailValid = ref(false);
const passwordValid = ref(false);

const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$.,!%*#?&])[A-Za-z\d@$.,!%*#?&]{6,}$/;


watch(errorMessage, (newValue) => {
    if (newValue) {
            setTimeout(() => {
            errorMessage.value = '';
        }, 1500);
    }
});

const isFormValid = computed(() => {
    return emailValid.value && passwordValid.value;
});

const validateEmail = () => {
    emailValid.value = emailPattern.test(email.value);
    if (!emailValid.value) {
        errorMessage.value = 'Por favor, introduce un email válido.';
    }
};

const validatePassword = () => {
    passwordValid.value = passwordPattern.test(password.value);
    if (!passwordValid.value) {
        errorMessage.value = 'La contraseña debe tener al menos 6 caracteres, incluyendo al menos un número y un carácter especial (@$.,!%*#?&).';
    }
};

const signInSubmit = async () => {
    if (isFormValid.value) {
        try {
            await authStore.signIn(email.value, password.value);
            if (authStore.errorMessage) {
                errorMessage.value = authStore.errorMessage;
            }
            else {
                console.log(authStore.currentUser.nickname);
                router.push(`/${authStore.currentUser.nickname}`);
            }
        } catch (error) {
            console.error('Error during signIn:', error);
            errorMessage.value = 'Failed to sign in. Please try again.';
        }
    }
};
</script>


<style scoped>

.signIn-section{
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 40px;
    margin-bottom: 20px;
}
.signIn-section-title {
    font-family: 'Anton', sans-serif;
    font-size: 60px;
    text-decoration: none;
    margin-top: -30px;
}
.signIn-section-subtitle{
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'ITC-Avant-Garde-Gothic-LT-Bold', sans-serif;
    font-size: 20px;
    text-decoration: none;
    margin-top: -30px;
    margin-bottom: 20px;
}

.signIn-container {
    display:flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 30px;
}
.signIn-box {
    background-image: url('../../assets/box-background.png');
    background-size: cover; /* Ajusta la imagen para que cubra todo el fondo */
    background-position: center; /* Centra la imagen */
    background-repeat: no-repeat; /* Evita que la imagen se repita */
    padding: 20px;
    border-radius: 10px;
    max-width: 45%;
    width: 100%;
    box-shadow: 0 0 3px rgb(78, 78, 78);
}
.signIn-title {
    margin-top: 10px;
    margin-bottom: 10px;
    font-family: 'Poppins-SemiBold', sans-serif;
    font-size: 20px;
    text-decoration: none;
    color: white;
    text-align: center;
}
.input-title-info {
    text-align: center;
    font-size: 15px;
    font-family: 'Poppins-Regular', sans-serif;
    color: white;
    margin: 5px 0 5px 0;
}
.form-group {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
    font-size: 20px;
}
.form-group:hover{
    transition: all .2s;
    transform: scale(1.009);
    filter: drop-shadow(0 0 7px black);
}
input {
    display: flex;
    text-align: center;
    font-family: 'Poppins-Regular', sans-serif;
    width: 80%;
    padding: 13px;
    border: 1px solid #ccc;
    border-radius: 10px;
}
.valid-input {
    border: 4px solid rgb(113, 195, 113);
}

.button-signIn {
    font-family: 'Poppins-Medium', sans-serif;
    display: block;
    margin: 0 auto;
    background-color: rgb(255, 255, 255);
    color: #000000;
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    margin-top: 30px;
    cursor: pointer;
}
.button-signIn:hover {
    text-decoration: none;
    transition: all .2s;
    transform: scale(1.009);
    filter: drop-shadow(0 0 7px black);
    background-color: rgb(87, 196, 255);
}
.btn-disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.extra-info {
    font-family: 'Poppins-Medium', sans-serif;
    margin-top: 30px;
    margin-bottom: 15px;
    display: block;
    cursor: default;
    color: white;
    font-weight: bold;
    font-size: 14px;
    text-align: center;
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

.link {
    text-decoration: none;
    color: rgb(74, 168, 218);
}

.link:hover {
    color: #ab4ee5;
}
</style>