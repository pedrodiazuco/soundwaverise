import { defineStore } from 'pinia';
import axios from 'axios';
import persistedstate from 'pinia-plugin-persistedstate';

const apiClient = axios.create({
  baseURL: 'https://api-soundwaverise-2a04104164b5.herokuapp.com/api/auth',
  withCredentials: true,  // Para que las cookies se envíen con cada solicitud
  headers: {
    'Content-Type': 'application/json'
  }
});

/*------ FUNCIONES DEL STORE  ------*/
export const useAuthStore = defineStore({
  id: 'auth',
  persist: {
    key: 'auth',
    storage: window.localStorage,
    paths: ['currentUser']
  },
  state: () => ({
    currentUser: null,
    errorMessage: ''
  }),
  actions: {

    /*------ OBTIENE EL USUARIO Y LO CARGA ------*/
    async fetchUser() {
      try {
        const response = await apiClient.get('/user');
        this.currentUser = response.data.user;
        this.errorMessage = '';
        console.log(response.data.user);
      } 
      catch (error) {
        console.error('Error obteniendo el usuario:', error);
        if (error?.response) {
            this.errorMessage = error.response.data.message;
        }
        else {
            this.errorMessage = 'Error al obtener el usuario. Inténtelo de nuevo más tarde.';
        }
      }
    },

    /*------ INICIO DE SESIÓN DE USUARIO ------*/
    async signIn(email, password) {
      try {
        const response = await apiClient.post('/signIn', {email, password});
        this.currentUser = response.data.user;
        this.errorMessage = '';
        console.log(response);
      } 
      catch (error) {
        console.error('Error al iniciar sesión:', error);
        if (error?.response) {
            this.errorMessage = error.response.data.message;
        }
        else {
          this.errorMessage = 'Error durante el inicio de sesión. Inténtelo de nuevo más tarde.';
        }
      }
    },

    /*------ REGISTRO DE USUARIO ------*/
    async signUp(userData) {
      try {
        const response = await apiClient.post('/signUp', userData);
        this.currentUser = response.data.user;
        this.errorMessage = '';
        console.log(response);
      } 
      catch (error) {
        console.error('Error durante el registro de usuario:', error);
        if (error?.response) {
          this.errorMessage = error.response.data.message;
        } 
        else {
          this.errorMessage = 'Error durante el registro de usuario. Inténtelo de nuevo más tarde.';
        }
      }
    },

    /*------ CIERRE DE SESIÓN DEL USUARIO ------*/
    async signOut() {
      try {
        await apiClient.post('/signOut');
        this.$reset();
        this.currentUser = null;
        this.errorMessage = '';
      } 
      catch (error) {
        console.error('Error durante el cierre de sesión:', error);
        if (error?.response) {
          this.errorMessage = error.response.data.message;
        }
        else {
          this.errorMessage = 'Error durante el cierre de sesión. Inténtelo de nuevo más tarde.';
        }
      }
    },

    /*------ REQUERIR AUTENTIFICACIÓN EN VISTAS ------*/
    requireAuth() {
      this.errorMessage = 'Debes iniciar sesión para acceder a esta página.';
    }

  },
  getters: {
    getUser(state){
      return state.currentUser;
    }
  }

});
