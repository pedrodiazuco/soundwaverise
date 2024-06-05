<template>
  <!-- Sección actual -->
  <div class="section" v-if="isUserLoggedIn">
    <div class="section-title">
      ¡SUBE TU TRACK!
    </div>
  </div>
  <div class="section-subtitle">
    Añade el archivo de audio e imagen de tu track.
  </div>
  <div class="uploadTrack-container">
    <!-- Tajeta de subir un track -->
    <div class="uploadTrack-card">
      <div class="card-info">
        <!-- Caja para la imagen ya recortada -->
        <div v-if="croppedImage">
          <img :src="croppedImage" class="cropped-track-image" alt="Cropped Image">
          <<button @click="changeImage" class="change-image-btn">Cambiar Imagen</button>
        </div>
        <!-- Caja para la imagen sin recortar -->
        <div v-if="!croppedImage" class="cropped-track-image">
          <div class="file-upload">
            <input type="file" id="file" @change="onSelectImgFile" accept="image/*" hidden>
            <label for="file" class="upload-btn">Subir imagen del track</label>
          </div>
          <div v-if="imageSrc">
            <div class="cropped-image-container">
              <img ref="imageElement" :src="imageSrc" alt="Source Image">
            </div>
            <button @click="cropImage" class="save-btn">Guardar</button>
          </div>
        </div>
        <div v-if="!cropData.isValid" class="error-message">
          {{ cropData.validationMessage }}
        </div>
        <div class="divider"></div>
        <div class="track-info">
          <div class="track-title" for="trackTitle">Añade un título al track:</div>
          <div class="form-group">
            <input class="track-title-input" type="text" id="trackTitle" v-model.trim="trackTitle" placeholder="Título">
          </div>
          <div class="track-description" for="trackDescription">Añade una descripción:</div>
          <div class="form-group">
            <textarea class="description-content" rows="6" maxlength="2000" id="trackDescription"
              v-model="trackDescription" placeholder="Introduce una descripción">
                </textarea>
          </div>
          <div class="form-group">
            <div class="track-title" for="trackTitle">Añade un archivo de audio:</div>
            <input type="file" class="upload-audio-btn" @change="setAudioFile" accept="audio/*">
          </div>
          <div class="form-group">
            <select id="trackGenre" v-model="selectedGenre" class="select-genre">
              <option value="" disabled selected>Selecciona el género del Track</option>
              <option class="genres" v-for="genre in genres" :key="genre">
                {{ genre }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- Botón de submit -->
  <form @submit.prevent="uploadTrackSubmit" class="upload-btn-container">
    <button class="upload-track-btn" type="submit"
      :disabled="!croppedImage || !trackTitle || !trackDescription || !audioFile || !selectedGenre">
      Subir Track
    </button>
  </form>
  <!-- Mostrar el error si ocurre -->
  <transition name="fade">
    <div v-if="errorMessage" class="error-popup">
      <div class="error-message">{{ errorMessage }}</div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, watch } from 'vue';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import { useAuthStore } from '../../store/authStore';
import { useUploadsStore } from '../../store/uploadsStore';
import { useTracksStore } from '../../store/tracksStore';
import { useRouter } from 'vue-router';
import { v4 as uuidv4 } from 'uuid';

const authStore = useAuthStore();
const uploadsStore = useUploadsStore();
const tracksStore = useTracksStore();
const router = useRouter();
const user = ref(null);
const uniqueId = uuidv4();


const imageSrc = ref(null);
const cropper = ref(null);
const croppedImage = ref(null);
const imageElement = ref(null);
const cropData = ref({
  isValid: true,
  validationMessage: ''
})

const trackTitle = ref('');
const trackDescription = ref('');
const audioFile = ref(null);
const errorMessage = ref('');

const isUserLoggedIn = computed(() => !!authStore.currentUser);

const selectedGenre = ref('');
const genres = [
  'Reggaeton, Dembow',
  'Latin House',
  'House',
  'Techno',
  'Breakbeat',
  'Drum & Bass',
  'Dubstep',
  'Rock, Pop'
];

onMounted(async () => {
  if (imageElement.value) {
    initCropper();
  }
});

//OBSERVADOR PARA ESTABLECER EL TIEMPO DEL MENSAJE DE ERROR
watch(errorMessage, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      errorMessage.value = '';
    }, 1500);
  }
});

//OBSERVADOR POR SI CAMBIA LA FOTO EL USUARIO, ACTUALIZA LA URL DE LA IMAGEN
watch(() => user.value ? user.value.photo_url : '', (newVal, oldVal) => {
  if (newVal !== oldVal) {
    updateImageSrc();
  }
});

//INICIALIZACIÓN DEL RECORTE
const initCropper = () => {
  nextTick(() => {
    if (imageElement.value) {
      cropper.value = new Cropper(imageElement.value, {
        aspectRatio: 1,
        viewMode: 1,
        autoCropArea: 0.8,
        dragMode: 'move',
        restore: false,
        guides: false,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
        crop(event) {
        },
        ready: function () {
          // Centrar el área de recorte cuando la imagen se carga
          const containerData = this.cropper.getContainerData();
          const cropBoxData = this.cropper.getCropBoxData();
          const aspectRatio = cropBoxData.width / cropBoxData.height;
          const newCropBoxWidth = containerData.width;
          const newCropBoxHeight = newCropBoxWidth / aspectRatio;
          this.cropper.setCropBoxData({
            left: (containerData.width - newCropBoxWidth) / 2,
            top: (containerData.height - newCropBoxHeight) / 2,
            width: newCropBoxWidth,
            height: newCropBoxHeight
          });
        }
      });
    }
  });
};

//AL SELECCIONAR ARCHIVO DE IMAGEN
const onSelectImgFile = (event) => {
  const files = event.target.files;
  if (files && files.length > 0) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imageSrc.value = e.target.result;
      nextTick(() => {
        if (cropper.value) {
          cropper.value.destroy();
        }
        initCropper();
      });
    };
    reader.readAsDataURL(files[0]);
  }
};

//COGE LA IMAGEN RECORTADA, LA COMPRIME Y LA CONVIERTE EN UN OBJETO
const cropImage = () => {
  const imageName = uuidv4() + '_cover.png';
  if (!cropper.value || !cropper.value.getCroppedCanvas) {
    console.error('El objeto cropper.value no está definido o no tiene el método getCroppedCanvas.');
    return;
  }
  const canvas = cropper.value.getCroppedCanvas();
  if (!canvas) {
    console.error('No se pudo obtener el lienzo recortado.');
    return;
  }
  canvas.toBlob(async (blob) => {
    if (!blob) {
      console.error('El objeto Blob generado es indefinido.');
      return;
    }
    try {
      const maxSizeInBytes = 500 * 1024; // 500 KB como tamaño máximo
      let quality = 0.9; // Calidad inicial
      let targetSizeReached = false;

      while (!targetSizeReached && quality > 0.1) {
        // Reducir la calidad de la imagen
        blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
        // Verificar si el tamaño del blob es menor o igual al límite deseado
        if (blob.size <= maxSizeInBytes) {
          targetSizeReached = true;
        } else {
          // Si el tamaño excede el límite, reducir aún más la calidad para intentar alcanzar el tamaño deseado
          quality -= 0.1;
        }
      }
      // Crear un nuevo objeto File a partir del Blob comprimido
      const file = new File([blob], imageName, { type: "image/jpeg" });
      // Establecer la imagen comprimida en el estado
      croppedImage.value = URL.createObjectURL(file);
      // Guardar el archivo para su posterior uso en la carga
      croppedImage.file = file;
      console.log('Imagen comprimida:', croppedImage.file);
    } catch (error) {
      console.error('Error al comprimir la imagen:', error);
    }
  }, 'image/jpeg');
};

//PARA CAMBIAR LA IMAGEN ACTUAL
const changeImage = () => {
  croppedImage.value = null;
  imageSrc.value = null;
};

//PARA MANEJAR LA SELECCIÓN DEL ARCHIVO DE AUDIO
const setAudioFile = async (event) => {
  console.log('ARCHIVO DE AUDIO RECIBIDO')
  const fileImported = event.target.files[0];
  if (!fileImported) {
    console.log('No se ha seleccionado ningún archivo de audio.');
    errorMessage.value = 'Por favor, selecciona un archivo de audio.';
    return;
  }
  const audioName = uuidv4() + '_audio.mp3';
  console.log(audioName);
  // Crear un nuevo objeto File a partir del Blob comprimido
  const audioFileCreated = new File([fileImported], audioName, { type: "audio/mp3" });
  // Establecer la imagen comprimida en el estado
  audioFile.value = URL.createObjectURL(audioFileCreated);
  // Guardar el archivo para su posterior uso en la carga
  audioFile.file = audioFileCreated;
  console.log('Audio file set for upload:', audioFile.file);
};

//AL PULSAR SOBRE EL BOTÓN DE SUBMIT, SUBIR EL TRACK
const uploadTrackSubmit = async () => {
  if (!croppedImage.file || !audioFile.file || !selectedGenre.value || !trackDescription.value) {
    errorMessage.value = 'Debe incluir imagen y audio antes de subir.';
    return;
  }
  try {
    //Si existe el archivo de la imagen recortada y la biografía
    if (croppedImage.file && audioFile.file && selectedGenre.value) {
      // Subir imagen
      const imageFormData = new FormData();
      imageFormData.append("image", croppedImage.file);
      console.log('IMAGE TO UPLOAD:', imageFormData);
      const imageUrl = await uploadsStore.uploadTrackImage(imageFormData);
      // Subir y convertir audio
      const audioFormData = new FormData();
      audioFormData.append("audio", audioFile.file);
      console.log('AUDIO TO UPLOAD:', audioFormData.file);
      const audioUrl = await uploadsStore.uploadTrackAudio(audioFormData);
      //Insertar track en la base de datos
      const trackData = {
        id: uniqueId,
        title: trackTitle.value,
        genre: selectedGenre.value,
        audio_url: audioUrl,
        cover_url: imageUrl,
        description: trackDescription.value
      };
      console.log(trackData);
      await tracksStore.addTrack(trackData);

      if (uploadsStore.errorMessage || tracksStore.errorMessage) {
        errorMessage.value = uploadsStore.errorMessage || tracksStore.errorMessage || 'Un error desconocido ha ocurrido.';
      } else {
        const currentUser = authStore.getUser;
        router.push(`/${currentUser.nickname}`);
      }
    } else {
      errorMessage.value = 'Debe incluir audio e imagen';
      throw new Error('Image and audio not found or data missing');
    }
  } catch (error) {
    console.error('Error during upload Track:', error);
    errorMessage.value = 'Error during upload track. Please try again later.';
  }
};
</script>

<style scoped>
.section {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 40px;
  margin-bottom: 20px;
}

.section-title {
  justify-content: center;
  font-family: 'Anton', sans-serif;
  font-size: 70px;
  text-decoration: none;
  margin-top: -30px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.section-subtitle {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'ITC-Avant-Garde-Gothic-LT-Bold', sans-serif;
  font-size: 20px;
  text-decoration: none;
  margin-top: -30px;
  margin-bottom: 20px;
}

.uploadTrack-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 30px;
}

.uploadTrack-card {
  display: flex;
  position: relative;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: auto;
  min-width: 40%;
  max-width: 75%;
  margin: auto;
  background-size: cover;
  background-position: center;
  border-width: 2px;
  border-style: solid;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 0;
}

.uploadTrack-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(grey, black 80%);
  z-index: 1;
}

.card-info {
  display: flex;
  flex-direction: row;
  align-items: column;
  text-shadow: 0px 0px 6px rgba(0, 0, 0, 1);
  z-index: 2;
}

.cropped-track-image {
  display: flex;
  width: 150px;
  height: 150px;
  border-radius: 3%;
  border: 3px solid #ffffff;
  margin-right: 100px;
  margin-left: 40px;
  flex-shrink: 0;
  align-self: center;
}

.change-image-btn {
  display: flex;
  align-items: center;
  background-color: #292929;
  color: white;
  margin-left: 45px;
  padding: 8px 16px;
  font-family: 'Poppins', sans-serif;
  font-size: 13.13px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 2px solid rgb(255, 255, 255);
  border-radius: 8px;
  outline: none;
  text-align: center;
  transition: background-color 0.3s, box-shadow 0.3s;
}

.file-upload {
  position: relative;
  display: inline-block;
}

.upload-btn {
  display: flex;
  background-color: transparent;
  color: white;
  padding: 55px 16px;
  font-family: 'Poppins', sans-serif;
  font-size: 13.13px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  outline: none;
  text-align: center;
  align-self: center;
  transition: background-color 0.3s, box-shadow 0.3s;
}

.upload-btn:hover,
.upload-btn:focus {
  background-color: rgb(87, 196, 255);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}


.cropped-image-container {
  width: 200px;
  height: 150px;
  overflow: hidden;
  position: relative;
  justify-content: center;
  align-items: inline;
}

.image-container {
  width: 300px;
  height: 300px;
  overflow: hidden;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  position: absolute;
  top: 0;
  left: 0;
}

.save-btn {
  align-items: center;
  background-color: #292929;
  color: white;
  margin-left: 55px;
  margin-top: 0px;
  padding: 5px 16px;
  font-family: 'Poppins', sans-serif;
  font-size: 13.13px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 2px solid rgb(255, 255, 255);
  outline: none;
  text-align: center;
  transition: background-color 0.3s, box-shadow 0.3s;
}

.save-btn:hover,
.save-btn:focus {
  background-color: rgb(87, 196, 255);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}



.artist-photo {
  width: 150px;
  height: 150px;
  border-radius: 3%;
  border: 3px solid #ffffff;
  margin-right: 20px;
  margin-left: 0px;
  flex-shrink: 0;
  align-self: center;
}

.divider {
  align-self: stretch;
  width: 3px;
  height: 100%;
  background-color: #ffffff;
  border-radius: 10px;
  margin: 0 30px;
  height: auto;
}

.track-info {
  flex-grow: 2;
  overflow-y: auto;
  max-height: 100%;
  max-width: 100%;
  padding: 9px 0 0 10px;
  margin-left: 40px;
  margin-right: 40px;
}

.track-title {
  color: rgb(255, 255, 255);
  font-size: 16px;
  font-family: 'Poppins-SemiBold', sans-serif;
}

.track-title-input {
  display: flex;
  font-family: 'Poppins-Regular', sans-serif;
  width: 80%;
  padding: 5px 8px;
  border: 1px solid #ccc;
  border-radius: 10px;
  color: rgb(0, 0, 0);
  font-size: 14px;
  font-family: 'Poppins-SemiBold', sans-serif;
  margin-bottom: 10px;
}

.track-description {
  color: rgb(255, 255, 255);
  font-size: 16px;
  font-family: 'Poppins-SemiBold', sans-serif;
}

.description-content {
  display: flex;
  font-family: 'Poppins-Regular', sans-serif;
  width: 80%;
  padding: 5px 8px;
  border: 1px solid #ccc;
  border-radius: 10px;
  color: rgb(0, 0, 0);
  font-size: 14px;
  font-family: 'Poppins-SemiBold', sans-serif;
  margin-bottom: 10px;
}

.upload-audio-btn {
  align-items: center;
  background-color: #292929;
  color: white;
  padding: 5px;
  font-family: 'Poppins', sans-serif;
  font-size: 13.13px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 2px solid rgb(255, 255, 255);
  border-radius: 4px;
  outline: none;
  text-align: center;
  transition: background-color 0.3s, box-shadow 0.3s;
  margin-bottom: 10px;
}

.select-genre {
  display: flex;
  text-align: center;
  font-family: 'Poppins-Regular', sans-serif;
  width: 84%;
  padding: 12px 5px 12px 5px;
  border: 1px solid #ccc;
  border-radius: 10px;
  margin-bottom: 10px;
}

.genres {
  display: block;
  color: rgb(51, 65, 65);
  margin-left: 50px;
}

.upload-btn-container {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 10px;
}

.upload-track-btn {
  background-color: black;
  font-size: 17px;
  color: white;
  padding: 10px 40px;
  margin-bottom: 20px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
}

.upload-track-btn:hover {
  background-color: #548c32;
}

.upload-track-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>