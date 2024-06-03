import { defineStore } from 'pinia';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://api-soundwaverise-2a04104164b5.herokuapp.com/api',
  withCredentials: true  // Para que las cookies se envíen con cada solicitud
});

/*------ FUNCIONES DEL STORE  ------*/
export const useUploadsStore = defineStore({
  id: 'uploads',
  state: () => ({
    errorMessage: ''
  }),
  actions: {

    /*------ SUBE LA FOTO DE UN USUARIO ------*/
    async uploadProfilePhoto(imageFormData) {
      try {
        const response = await apiClient.post('/upload/userImage', imageFormData);
        console.log('URL en uploadProfilePhoto: ' + response.data.publicImageUrl);
        this.errorMessage = '';
        return response.data.publicImageUrl;  // Suponemos que el backend devuelve la URL de la imagen subida
      }
      catch (error) {
        console.error('Error al subir la foto de perfil:', error);
        if (error?.response) {
          this.errorMessage = error.response.data.message;
        }
        else {
            this.errorMessage = 'Error al subir la foto de perfil. Inténtelo de nuevo más tarde.';
        }
        return null;
      }
    },

    /*------ SUBE LA FOTO DE UN TRACK ------*/
    async uploadTrackImage(imageFormData) {
      try {
        const response = await apiClient.post('/upload/trackImage', imageFormData);
        console.log('Respuesta en uploadTrackImage: ' + response.data.publicImageUrl);
        this.errorMessage = '';
        return response.data.publicImageUrl;  // Suponemos que el backend devuelve la URL de la imagen subida
      } 
      catch (error) {
        console.error('Error al subir la imagen del track:', error);
        if (error?.response) {
          this.errorMessage = error.response.data.message;
        }
        else {
            this.errorMessage = 'Error al subir la imagen del track. Inténtelo de nuevo más tarde.';
        }
        return null;
      }
    },

    /*------ SUBE EL AUDIO DE UN TRACK ------*/
    async uploadTrackAudio(audioFormData) {
      try {
        const response = await apiClient.post('/upload/trackAudio', audioFormData);
        console.log('Respuesta en uploadTrackAudio: ' + response.data.publicAudioUrl);
        this.errorMessage = '';
        return response.data.publicAudioUrl;  // Suponemos que el backend devuelve la URL de la imagen subida
      } catch (error) {
        console.error('Error al subir el audio del track:', error);
        if (error?.response) {
          this.errorMessage = error.response.data.message;
        }
        else {
            this.errorMessage = 'Error al subir el audio del track. Inténtelo de nuevo más tarde.';
        }
        return null;
      }
    }

  }
});