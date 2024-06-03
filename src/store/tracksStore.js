import { defineStore } from 'pinia';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://api-soundwaverise-2a04104164b5.herokuapp.com/api/tracks',
  withCredentials: true,  // Para que las cookies se envíen con cada solicitud
  headers: {
    'Content-Type': 'application/json'
  }
});

/*------ FUNCIONES DEL STORE  ------*/
export const useTracksStore = defineStore({
  id: 'tracks',
  state: () => ({
    tracks: [],
    comments: [],
    currentTrack: null,
    errorMessage: ''
  }),
  persist: {
    key: 'tracks',
    storage: window.localStorage,
    paths: ['currentTrack']
  },
  actions: {

    /*------ CARGA EL TRACK ACTUAL ------*/
    setCurrentTrack(track) {
      this.currentTrack = track;
    },

    /*------ OBTIENE LOS TRACKS Y LOS CARGA ------*/
    async fetchAllTracks() {
      try {
        const response = await apiClient.get('/');
        console.log(response.data.tracks)
        if (response.data && Array.isArray(response.data.tracks)) {
          this.tracks = response.data.tracks;
        } else {
          this.errorMessage = 'Formato de respuesta inesperado';
        }
        this.errorMessage = '';
      }
      catch (error) {
        console.error('Error during fecth tracks:', error);
        if (error?.response) {
            this.errorMessage = error.response.data.message;
        } else {
            this.errorMessage = 'Error during fetch tracks. Please try again later.';
        }
      }
    },

    /*------ OBTIENE LOS TRACKS DE UN USUARIO Y LOS CARGA ------*/
    async fetchAllTrackskByUserId(user_id) {
      try {
        const response = await apiClient.get(`/userTracks/${user_id}`);
        console.log(response.data.tracks)
        if (response.data && Array.isArray(response.data.tracks)) {
          this.tracks = response.data.tracks;
          this.errorMessage = '';
        } else {
          this.errorMessage = 'Formato de respuesta inesperado';
        }
      }
      catch (error) {
        console.error('Error during fecth tracks:', error);
        if (error?.response) {
            this.errorMessage = error.response.data.message;
        } else {
            this.errorMessage = 'Error during fetch tracks. Please try again later.';
        }
      }
    },

    /*------ OBTIENE EL TRACK ACTUAL PASANDO LA ID (PARA TENERLO ACTUALIZADO)------*/
    async fetchTrack() {
      if (this.currentTrack && this.currentTrack.id) {
        await this.fetchTrackById(this.currentTrack.id);
      }
      this.errorMessage = '';
    },

    /*------ OBTIENE UN TRACK POR EL ID Y LO CARGA ------*/
    async fetchTrackById(track_id) {
      try {
        const response = await apiClient.get(`/track/${track_id}`);
        if (response.data && response.data.track) {
          this.currentTrack = response.data.track;
          this.errorMessage = '';
        } else {
          this.errorMessage = 'Usuario no encontrado';
        }
      } catch (error) {
        console.error('Error fetching track by id:', error);
        if (error?.response) {
          this.errorMessage = error.response.data.message;
        } else {
          this.errorMessage = 'Error during fetch track. Please try again later.';
        }
      }
    },

    /*------ AÑADE UN TRACK ------*/
    async addTrack(trackData) {
      try {
        const response = await apiClient.post('/createTrack', trackData);
        this.errorMessage = '';
        return response.data;
      } 
      catch (error) {
        console.error('Error al añadir un track:', error);
        if (error?.response) {
          this.errorMessage = error.response.data.message;
        }
        else {
          this.errorMessage = 'Error al añadir un track. Inténtelo de nuevo más tarde.';
        }
        return null;
      }
    },

    /*------ ELIMINA UN TRACK ------*/
    async deleteTrack(id) {
      try {
        await apiClient.post(`/deleteTrack/${id}`);
        await this.fetchAllTracks();
        this.errorMessage = '';
      } 
      catch (error) {
        console.error(`Error al eliminar un track con id ${id}:`, error);
        if (error?.response) {
          this.errorMessage = error.response.data.message;
        }
        else {
          this.errorMessage = 'Error al eliminar un track. Inténtelo de nuevo más tarde.';
        }
      }
    },

    /*------ ACTUALIZA UN TRACK ------*/
    async updateTrack(id, trackData) {
      try {
        await apiClient.post(`/updateTrack/${id}`, trackData);
        this.errorMessage = '';
      } 
      catch (error) {
        console.error(`Error al actualizar un track con id ${id}:`, error);
        if (error?.response) {
          this.errorMessage = error.response.data.message;
        }
        else {
          this.errorMessage = 'Error al actualizar un track. Inténtelo de nuevo más tarde.';
        }
      }
    },

    /*------ INCREMENTA EL LIKE DE LOS COMENTARIOS ------*/
    async incrementPlayCount(id) {
      try {
        await apiClient.post(`/incrementPlays/${id}`, { id });
        this.errorMessage = '';
      } 
      catch (error) {
        console.error('Error al incremnetar plays:', error);
        if (error?.response) {
          this.errorMessage = error.response.data.message;
        }
        else {
          this.errorMessage = 'Error al incremnetar plays de un track. Inténtelo de nuevo más tarde.';
        }
        return null;
      }
    },

    /*------ AÑADE UN LIKE ------*/
    async addLike(id, user_id) {
      try {
        await apiClient.post(`/createLike/${id}`, { user_id });
        this.errorMessage = '';
      } 
      catch (error) {
        console.error('Error al añadir un like:', error);
        if (error?.response) {
          this.errorMessage = error.response.data.message;
        }
        else {
          this.errorMessage = 'Error al añadir un like de un track. Inténtelo de nuevo más tarde.';
        }
        return null;
      }
    },

    /*------ AÑADE UN COMENTARIO ------*/
    async addComment(id, commentData) {
      try {
        await apiClient.post(`/createComment/${id}`, commentData);
        await this.fetchAllCommentsByTrackId(id);
        this.errorMessage = '';
      } 
      catch (error) {
        console.error('Error al añadir un comentario:', error);
        if (error?.response) {
          this.errorMessage = error.response.data.message;
        }
        else {
          this.errorMessage = 'Error al añadir un comentario de un track. Inténtelo de nuevo más tarde.';
        }
        return null;
      }
    },

    /*------ OBTIENE LOS COMENTARIOS DE UN TRACK Y LOS CARGA ------*/
    async fetchAllCommentsByTrackId(track_id) {
      try {
        const response = await apiClient.get(`/comments/${track_id}`);
        if (response.data && Array.isArray(response.data.comments)) {
          this.comments = response.data.comments;
          console.log(this.comments);
          this.errorMessage = '';
        }
        else {
          this.errorMessage = 'Formato de respuesta inesperado.';
        }
      }
      catch (error) {
        console.error('Error obteniendo los comentarios:', error);
        if (error?.response) {
          this.errorMessage = error.response.data.message;
        }
        else {
          this.errorMessage = 'Error al obtener los comentarios de un track. Inténtelo de nuevo más tarde.';
        }
      }
    },

    /*------ COMPRUEBA SI UN USUARIO HA DADO UN LIKE ------*/
    async checkIfUserHasLiked(id, user_id) {
      try {
        const response = await apiClient.post(`/userHasLiked/${id}`, { user_id });
        console.log("RESPUESTA EN CHECK LIKED: " + response.data.hasLiked);
        this.errorMessage = '';
        return response.data.hasLiked;
      } 
      catch (error) {
        console.error('Error al comprobar si un usuario ha dado el like:', error);
        if (error?.response) {
          this.errorMessage = error.response.data.message;
        }
        else {
          this.errorMessage = 'Error al comprobar si un usuario ha dado el like. Inténtelo de nuevo más tarde.';
        }
        return false;
      }
    },

    /*------ COMPRUEBA SI UN USUARIO HA COMENTADO ------*/
    async checkIfUserHasCommented(id, user_id) {
      try {
        const response = await apiClient.post(`/userHasCommented/${id}`, { user_id });
        console.log("RESPUESTA EN CHECK COMMENT: " + response.data.hasCommented);
        this.errorMessage = '';
        return response.data.hasCommented;
      } 
      catch (error) {
        console.error('Error al comprobar si un usuario ha comentado:', error);
        if (error?.response) {
          this.errorMessage = error.response.data.message;
        }
        else {
          this.errorMessage = 'Error al comprobar si un usuario ha comentado. Inténtelo de nuevo más tarde.';
        }
        return false;
      }
    }
  }

});