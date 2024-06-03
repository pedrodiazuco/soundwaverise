//IMPORTACIONES GENERALES
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from './App.vue';
import router from './router';
import axios from 'axios';

//CONFIGURACIÓN GLOBAL DE AXIOS 
axios.defaults.baseURL = 'https://api-soundwaverise-2a04104164b5.herokuapp.com/api/';
axios.defaults.withCredentials = true; // Asegúrate de enviar cookies con cada solicitud

//INICIALIZACIÓN PRINCIPAL
const app = createApp(App);

//CREAMOS LA INSTANCIA DE PINIA
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);  // Registramos el plugin de persistencia en la instancia de Pinia

//REGISTRAMOS PINIA Y EL ENRUTADOR
app.use(pinia);
app.use(router);

// Añadir una función global para manejar errores
app.config.globalProperties.$setError = function (errorMessage) {
    this.errorMessage = errorMessage;
    setTimeout(() => {
      this.errorMessage = ''; // Limpia el mensaje de error después de un tiempo
    }, 1500); // Ajusta el tiempo según sea necesario
};

//MONTAR LA APLICACIÓN VUE EN EL ELEMENTO DEL DOM
app.mount('#app');
