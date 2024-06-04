<template>
    <div class="section">
        <div class="section-title">
            COMPLETA TU PERFIL
        </div>
    </div>
    <div class="section-subtitle">
      Edita tu perfil de artista.
    </div>
    <div class="setProfile-container">
    <div v-if="currentUser" class="user-profile-card">
        <div class="card-info">
          <!-- Caja para la imagen que ya tiene el usuario -->
          <div v-if="currentUser.photo_url" >
            <img :src="imageUrl" class="artist-photo" alt="User Phot">
            <button @click="changeImage" class="change-image-btn">Cambiar Imagen</button>
          </div>
          <!-- Caja para la imagen ya recortada -->
          <div v-if="croppedImage" >
            <img :src="croppedImage" class="cropped-artist-photo" alt="Cropped Image">
            <button @click="changeImage" class="change-image-btn">Cambiar Imagen</button>
          </div>
          <!-- Caja para la imagen sin recortar -->
          <div v-if="!croppedImage & !currentUser.photo_url" class="cropped-artist-photo">
            <div class="file-upload">
              <input type="file" id="file" @change="onSelectFile" accept="image/*" hidden>
              <label for="file" class="upload-btn">Subir foto de perfil</label>
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
          <!-- Detalles del usuario -->
          <div class="user-details">
              <div class="nickname">{{ currentUser.nickname }}</div>
              <div class="email">{{ currentUser.email }}</div>
              <div class="province">{{ currentUser.province }}</div>
          </div>
          <div class="divider"></div>
          <!-- Caja para la biografía -->
          <div class="biography">
            <label class="biography-title" for="biography">Rellena tu biografía:</label>
            <textarea 
                  class="biography-content" 
                  rows="6" 
                  maxlength="2000" 
                  id="biography" 
                  v-model="biography" 
                  :placeholder= "placeholderText">
            </textarea>
          </div>
        </div>
      </div>
    </div>
    <!-- Botón de submit -->
    <form @submit.prevent="setProfileSubmit" class="profile-form">
      <button 
        class="button-setProfile" 
        type="submit" 
        :disabled="!(croppedImage || currentUser.photo_url) || !biography">
        Guardar Perfil
      </button>
    </form>
    <transition name="fade">
      <div v-if="errorMessage" class="error-popup">
          <div class="error-message">{{ errorMessage }}</div>
      </div>
    </transition>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import { useRoute } from 'vue-router';
import { useUsersStore } from '../../store/usersStore';
import { useAuthStore } from '../../store/authStore';
import { useUploadsStore } from '../../store/uploadsStore';
import { useRouter } from 'vue-router';

const usersStore = useUsersStore();
const authStore = useAuthStore();
const route = useRoute();
const uploadsStore = useUploadsStore();
const router = useRouter();
const errorMessage = ref('');
const currentUser = ref({
  photo_url: null,
  biography: ''
});
const imageSrc = ref(null);
const cropper = ref(null);
const croppedImage = ref(null);
const imageElement = ref(null);
const cropData = ref({
  isValid: true,
  validationMessage: ''
});
const imageUrl = ref('');

const placeholderText = 'Introduce tu biografía';
const biography = ref('');

// Actualiza la URL de la imagen cada vez que cambie user.photo_url
watch(() => currentUser.value?.photo_url, (newValue) => {
  imageUrl.value = `${newValue}?timestamp=${new Date().getTime()}`;
}, { immediate: true });

onMounted(async() => {
  await usersStore.fetchUser(route.params.nickname);
      if (usersStore.user) {
        currentUser.value = usersStore.user;
        biography.value = currentUser.value.biography;
        console.log(currentUser.value);
      }
  if (imageElement.value) {
    initCropper();
  }
});

watch(errorMessage, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      errorMessage.value = '';
    }, 1500);
  }
});

const initCropper = () => {
  nextTick(() => {
    if (imageElement.value) {
      cropper.value = new Cropper(imageElement.value, {
        aspectRatio: 1,
        viewMode: 1,
        autoCropArea: 0.8, // Ajusta para controlar el tamaño inicial del área de recorte
        dragMode: 'move',
        restore: false,
        guides: false,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
        ready: function () {
          // Centra el área de recorte cuando la imagen se carga
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
//AL SELECCIONAR ARCHIVO
const onSelectFile = (event) => {
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
  const fileName = currentUser.value.nickname + '_profileImage.png'; // Usaremos el mismo nombre de archivo para la imagen recortada y comprimida
  console.log('nombre de la imagen: '+ fileName);

  if (!cropper.value || !cropper.value.getCroppedCanvas) {
    console.error('El objeto cropper value no está definido o no tiene el método getCroppedCanvas.');
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
      const file = new File([blob], fileName, { type: "image/jpeg" });
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



// PARA CAMBIAR LA IMAGEN SELECCIONADA
const changeImage = () => {
  croppedImage.value = null;
  currentUser.value.photo_url = null;
  imageSrc.value = null;
};

const setProfileSubmit = async () => {
  try {
    const id = currentUser.value.id;
    const photo_url = currentUser.value.photo_url;

    //Si existe el archivo de la imagen recortada y la biografía
    if (croppedImage.file) {
      //Creamos objeto 'FormData' para contruir pares clave/valor de la imagen
      const imageFormData = new FormData();
      //Se añade a 'formData' el archivo de la imagen con la clave 'image'
      imageFormData.append("image", croppedImage.file);
      // Imprimir detalles del archivo
      for (let [key, value] of imageFormData.entries()) {
        console.log(`${key}:`, value);
        console.log(`File name: ${value.name}`);
        console.log(`File type: ${value.type}`);
        console.log(`File size: ${value.size} bytes`);
      }
      const imageUrl = await uploadsStore.uploadProfilePhoto(imageFormData);
      console.log('URL en setProfileSubmit: ' + imageUrl);
      console.log(biography.value);
      const userData = { photo_url: imageUrl, biography: biography.value };
      await usersStore.updateBioUser(id, userData);
    }
    else if (photo_url) {
      if (authStore.currentUser.role === "superAdmin" || authStore.currentUser.nickname === currentUser.value.nickname) {
        const userData = { photo_url: photo_url, biography: biography.value };
        await usersStore.updateBioUser(id, userData);
      }
    }
    else {
      errorMessage.value = 'User not found or data missing';
      throw new Error('User not found or data missing');
    }

    if (usersStore.errorMessage) {
      errorMessage.value = usersStore.errorMessage;
    }
    else if (authStore.currentUser.role === "superAdmin"){
      router.push(`/profile/${currentUser.value.nickname}`);
    }
    else {
      router.push(`/${currentUser.value.nickname}`);
    }
  } catch (error) {
    console.error('Error during profile update:', error);
    errorMessage.value = 'Error during profile update. Please try again later.';
  }
};
</script>

<style scoped>

.section{
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
.section-subtitle{
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'ITC-Avant-Garde-Gothic-LT-Bold', sans-serif;
  font-size: 20px;
  text-decoration: none;
  margin-top: -30px;
  margin-bottom: 20px;
}

.setProfile-container {
  display:flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 30px;
}

.user-profile-card {
  display: flex;
  position: relative;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: auto; /* Ajusta el ancho según el contenido */
  min-width: 40%; /* Establece un mínimo, ajustable según necesidades */
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
.user-profile-card::before {
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
  align-items: column; /* Centrar los elementos verticalmente */
  text-shadow: 0px 0px 6px rgba(0, 0, 0, 1);
  z-index: 2;
}

.artist-photo {
  width: 150px;
  height: 150px;
  border-radius: 3%;
  border: 3px solid #ffffff; /* Borde negro sólido */
  margin-right: 20px;
  margin-left: 0px;
  flex-shrink: 0;
  align-self: center;
}

.user-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 0 20px 0 5px;
  flex-grow: 1;
  min-width: 0;
  justify-content: center; 
}
.nickname {
  color: rgb(255, 255, 255);
  padding-top: 10px;
  font-size: 16px;
  font-family: 'Poppins-SemiBold', sans-serif;
  white-space: normal;
  overflow-wrap: break-word;
}
.email {
  color: rgb(255, 255, 255);
  font-size: 16px;
  font-family: 'Poppins-SemiBold', sans-serif;
  white-space: normal;
  overflow-wrap: break-word;
}
.province {
  color: rgb(255, 255, 255);
  padding-top: 60px;
  padding-bottom: 10px;
  font-size: 16px;
  font-family: 'Poppins-SemiBold', sans-serif;
  white-space: normal;
  overflow-wrap: break-word;
}

.divider {
  align-self: stretch;
  width: 3px;
  height: 100%;
  background-color: #ffffff;
  border-radius: 10px;
  margin: 0 30px; /* Margen a los lados del divisor */
  height: auto; /* Ajusta la altura automáticamente al contenido */
}

.cropped-artist-photo {
  display: flex;
  width: 150px;
  height: 150px;
  border-radius: 3%;
  border: 3px solid #ffffff; /* Borde negro sólido */
  margin-right: 20px;
  margin-left: 0px;
  flex-shrink: 0;
  align-self: center;
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
  width: 300px; /* o el tamaño que prefieras */
  height: 300px; /* ajusta esto al aspecto deseado */
  overflow: hidden; /* asegura que nada se desborde */
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
.image-container img {
  width: 100%;
  height: 100%;
  object-fit: contain; /* Asegura que toda la imagen sea visible */
  position: absolute;
  top: 0;
  left: 0;
}
.profile-image img {
  width: 200px;
  height: 200px;
  border-radius: 50%;  /* Esto asegura la forma circular */
  object-fit: cover;   /* Asegura que la imagen cubra todo el espacio */
}
.file-upload {
  position: relative;
  display: inline-block;
}
.upload-btn {
  display: flex;
  background-color: transparent; /* Color azul */
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
.upload-btn:hover, .upload-btn:focus {
  background-color: rgb(87, 196, 255);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.save-btn {
  align-items: center;
  background-color: #292929; /* Color azul */
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
.save-btn:hover, .save-btn:focus {
  background-color: rgb(87, 196, 255);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}


.change-image-btn {
  display: flex;
  align-items: center;
  background-color: #292929; /* Color azul */
  color: white;
  margin-left: 2px;
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
.change-image-btn:hover, .change-image-btn:focus {
  background-color: rgb(87, 196, 255);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.profile-image button {
  margin-top: 10px;
  padding: 5px 10px;
  background-color: #007BFF;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
}

.biography {
  flex-grow: 2;
  overflow-y: auto; /* Habilita el desplazamiento vertical si el contenido excede el área visible */
  max-height: 100%; /* Altura máxima antes de que el desplazamiento sea necesario */
  max-width: 100%;
  padding: 9px 0 0 10px;
}
.biography-title {
  color: rgb(255, 255, 255);
  font-size: 16px;
  padding-left: 5px;
  font-family: 'Poppins-SemiBold', sans-serif;
}
textarea {
  width: 100%;
  min-width: 40%;
  box-sizing: border-box;
  padding: 6px 9px;
  border: none;
  border: 3px solid rgb(255, 255, 255);
  box-shadow: 0 0 3px rgb(78, 78, 78);
  background-color: transparent;
  border-radius: 4px;
  color: rgb(255, 255, 255);
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  white-space: pre-wrap;
}

.button-setProfile {
  display: block; /* Cambiar a block para centrar el botón en el formulario */
  margin: 40px auto; /* Centra el botón horizontalmente y agrega margen vertical */
  padding: 10px 20px; /* Añade padding para mejor clickabilidad */
  background-color: #292929; /* Color azul */
  color: white; /* Texto blanco para mejor contraste */
  font-size: 16px; /* Tamaño de fuente adecuado */
  border: none; /* Sin borde */
  border-radius: 5px; /* Bordes redondeados */
  cursor: pointer; /* Cursor de mano al pasar por encima */
  transition: background-color 0.3s ease; /* Transición suave del color de fondo */
}
.button-setProfile:hover {
  background-color: #0056b3; /* Oscurece el botón al pasar el cursor por encima */
}
.button-setProfile:disabled {
  background-color: #ccc; /* Color cuando el botón esté deshabilitado */
  cursor: not-allowed; /* Cursor no permitido */
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
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

</style>
