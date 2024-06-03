import { defineStore } from 'pinia';
import axios from 'axios';
import persistedstate from 'pinia-plugin-persistedstate';

const apiClient = axios.create({
  baseURL: 'https://api-soundwaverise-2a04104164b5.herokuapp.com/api',
  withCredentials: true,  // Para que las cookies se envíen con cada solicitud
  headers: {
    'Content-Type': 'application/json'
  }
});

/*------ FUNCIONES DEL STORE  ------*/
export const useUsersStore = defineStore({
  id: 'users',
  persist: {
    key: 'users',
    storage: window.localStorage,
    paths: ['users']
  },
  state: () => ({
    users: [],
    user: null,
    errorMessage: ''
  }),
  actions: {

    /*------ OBTIENE LOS USUARIOS Y LOS CARGA ------*/
    async fetchUsers() {
      try {
        const response = await apiClient.get('/users');
        console.log(response.data.users)
        if (response.data && Array.isArray(response.data.users)) {
          this.users = response.data.users;
          this.errorMessage = '';
        } else {
          this.errorMessage = 'Formato de respuesta inesperado.';
        }
      }
      catch (error) {
        console.error('Error obteniendo los usuarios:', error);
        if (error?.response) {
            this.errorMessage = error.response.data.message;
        } 
        else {
            this.errorMessage = 'Error obteniendo los usuarios. Inténtelo de nuevo más tarde.';
        }
      }
    },

    /*------ OBTIENE UN USUARIO POR EL NICKNAME Y LO CARGA ------*/
    async fetchUser(nickname) {
      try {
        const response = await apiClient.get(`/users/${nickname}`);
        if (response.data && response.data.user) {
          console.log(response.data.user);
          this.user = response.data.user;
          this.errorMessage = '';
        } else {
          this.errorMessage = 'Usuario no encontrado.';
        }
      } 
      catch (error) {
        console.error('Error obteniendo el usuario por su nickname:', error);
        if (error?.response) {
          this.errorMessage = error.response.data.message;
        } 
        else {
            this.errorMessage = 'Error obteniendo el usuario. Inténtelo de nuevo más tarde.';
        }
      }
    },

    /*------ ACTUALIZA LA BIOGRAFÍA DE UN USUARIO ------*/
    async updateBioUser(id, userData) {
      try {
          const response = await apiClient.post(`/users/updateBioUser/${id}`, userData);
          if (response.data && response.data.user) {
            console.log('Usuario actualizado correctamente');
            this.errorMessage = '';
          } else {
            console.error('rror actualizando la biografía:', response);
            this.errorMessage = 'Error actualizando la biografía. Inténtelo de nuevo más tarde.';
          }
      } 
      catch (error) {
        console.error('rror actualizando la biografía:', error);
        if (error?.response) {
          this.errorMessage = error.response.data.message;
        } 
        else {
            this.errorMessage = 'Error actualizando la biografía. Inténtelo de nuevo más tarde.';
        }
      }
    },

    /*------ (SUPER-ADMIN) ELIMINA A UN USUARIO ------*/
    async deleteUser(nickname) {
      try {
          await apiClient.post(`/superAdmin/deleteUser/${nickname}`);
          console.log('Usuario actualizado correctamente');
          this.errorMessage = '';
      } 
      catch (error) {
        console.error('Error eliminando un usuario:', error);
        if (error?.response) {
          this.errorMessage = error.response.data.message;
        } 
        else {
            this.errorMessage = 'Error eliminando un usuario. Inténtelo de nuevo más tarde.';
        }
      }
    },

    /*------ (SUPER-ADMIN) ACTUALIZAR EL ROL DE UN USUARIO ------*/
    async setSuperAdmin(nickname) {
      try {
          await apiClient.post(`/superAdmin/setSuperAdmin/${nickname}`);
          console.log('Rol del usuario actualizado correctamente');
          this.errorMessage = '';
      }
      catch (error) {
        console.error('Error eliminando un usuario:', error);
        if (error?.response) {
          this.errorMessage = error.response.data.message;
        }
        else {
            this.errorMessage = 'Error eliminando un usuario. Inténtelo de nuevo más tarde.';
        }
      }
    },

  }
});