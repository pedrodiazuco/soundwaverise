
<template>
  <!--Importamos las fuentes-->
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SOUND WAVE RISE</title>
    <link rel="icon" href="/soundwaverise/src/assets/swr-icon.png" type="image/png">
  </head>
  <body>
    <div id="app" class="body">
    <transition name="fade" appear>
      <div>
        <div class="header-container">
          <router-link class="main-logo" to="/">| SOUND WAVE RISE |</router-link>
        </div>

        <div class="component-container">
        <Navbar />
        <RouterView />
        </div>
        
        <div class="footer-container">
          <div class="social-media">
            <div class="facebook-section">
              <div class="footer-text">SOUNDWAVERISE_OFFICIAL</div>
              <img class="facebook-icon" src='./assets/facebook-icon.png'></img>
            </div>
            <div class="logo-section">
              <img class="logo-icon" src='./assets/swr-icon.png'></img>
            </div>
            <div class="instagram-section">
              <img class="instagram-icon" src='./assets/instagram-icon.png'></img>
              <div class="footer-text">SOUNDWAVERISE_OFFICIAL</div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
  </body>
</template>


<script septup>
import Navbar from './components/Navbar.vue'

export default {
    components: {
        Navbar
    },
};
</script>

<style>
html, body {
  height: 100%;
  min-height: 100vh;
  margin: 0px;
  padding: 0%;
  width: 100%;
  background-image: url('./assets/web-background.png');
  background-size: cover;
  background-position: center;
}
body::-webkit-scrollbar {
  background-image: url('./assets/web-background.png');
  width: 18px;
  border: 3px solid black ;
}
body::-webkit-scrollbar-thumb {
  border-radius: 50px;
  background: black;
}

#app {
  min-height: 100vh; /* Asegúrate de que el app también tenga al menos la altura de la ventana gráfica */
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Ajusta los elementos internos para cubrir verticalmente todo el espacio */
}

.header-container {
  width: 100%;
  height: auto; /* Ajusta la altura según tus necesidades */
  display: flex;
  justify-content: center;
}
.main-logo {
  margin: 10px;
  color: black;
  font-family: 'Anton', sans-serif;
  letter-spacing: 0.05em;
  font-size: 25px;
  text-decoration: none;
  /* Agrega otros estilos de texto según tus preferencias */
}
/* Cambiar color al pasar el mouse */
.main-logo:hover {
    color: rgb(10, 40, 65);
}



.footer-container {
  height: auto; /* Ajusta la altura según tus necesidades */
  display: flex;
  justify-content: center;
  align-items: center;
}
.social-media {
  display: flex;
  justify-content: space-between;
  width: 80%;
}
.facebook-section, .instagram-section, .logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
}
.facebook-icon {
  margin-left: 10px; /* Espacio entre el icono y el texto */
}
img.facebook-icon {
  height: 30px;
  width: 30px;
}
.logo-icon {
  margin: 10px 0; /* Espacio entre el icono y el texto */
}
img.logo-icon {
  height: 40px;
  width: 40px;
  filter: brightness(0) saturate(100%);
}
.instagram-icon {
  margin-right: 10px; /* Espacio entre el icono y el texto */
}
img.instagram-icon {
  height: 30px;
  width: 30px;
}


.footer-text {
  margin: 20px;
  color: black;
  font-size: 20px;
  text-decoration: none;
  font-family: 'Raleway', sans-serif;
  font-weight: bolder;
}

.header-container, .footer-container {
  flex-shrink: 0; /* Previene que estos contenedores cambien su tamaño */
}

.component-container {
  background-image: url('./assets/web-container-background.png');
  background-size: cover;
  background-position: center;
  flex-grow: 1; /* Permite que este contenedor crezca y llene el espacio disponible */
  padding-bottom: 80px; /* Padding para dar espacio al final del contenedor */
  height: 100%;
  min-height: 75vh;
  margin: 0px;
  width: 100%;
}


/* importaciones tipografías */
@font-face {
  font-family: 'Raleway';
  src: url('./assets/fonts/Raleway-Medium.ttf') format('truetype');
  font-weight: medium;
  font-style: medium;
}

@font-face {
  font-family: 'Poppins-Regular';
  src: url('./assets/fonts/Poppins-Regular.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: 'Poppins-SemiBold';
  src: url('./assets/fonts/Poppins-SemiBold.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: 'ITC-Avant-Garde-Gothic-LT-Bold';
  src: url('./assets/fonts/ITC-Avant-Garde-Gothic-LT-Bold.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.65s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.fade-enter-to, .fade-leave {
  opacity: 1;
}

</style>