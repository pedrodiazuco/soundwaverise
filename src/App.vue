<template>
  <!-- Contenido del cuerpo de la aplicación-->
  <body>
    <div id="app" class="body">
      <transition name="fade" appear>
        <div>
          <!-- Contenido de la cabecera principal de la aplicación-->
          <div class="header-container">
            <router-link class="main-logo" to="/">| SOUND WAVE RISE |</router-link>
          </div>
          <!-- Contenido del contenedor de componentes de la aplicación-->
          <div class="component-container">
            <Navbar />
            <RouterView />
          </div>
          <!-- Contenido del footer principal de la aplicación-->
          <div class="footer-container">
            <div class="social-media">
              <div class="facebook-section">
                <div class="footer-text">SOUNDWAVERISE_OFFICIAL</div>
                <img class="facebook-icon" src='./assets/icons/facebook-icon.png'></img>
              </div>
              <div class="logo-section">
                <img class="logo-icon" src='./assets/icons/swr-icon.png'></img>
              </div>
              <div class="instagram-section">
                <img class="instagram-icon" src='./assets/icons/instagram-icon.png'></img>
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
html,
body {
  height: 100%;
  min-height: 100vh;
  margin: 0px;
  padding: 0%;
  width: 100%;
  background-image: url('./assets/icons/web-background.png');
  background-size: cover;
  background-position: center;
}

body::-webkit-scrollbar {
  background-image: url('./assets/icons/web-background.png');
  width: 18px;
  border: 3px solid black;
}

body::-webkit-scrollbar-thumb {
  border-radius: 50px;
  background: black;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.header-container {
  width: 100%;
  height: auto;
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
}

.main-logo:hover {
  color: rgb(10, 40, 65);
}



.footer-container {
  height: auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.social-media {
  display: flex;
  justify-content: space-between;
  width: 80%;
}

.facebook-section,
.instagram-section,
.logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
}

.facebook-icon {
  margin-left: 10px;
}

img.facebook-icon {
  height: 30px;
  width: 30px;
}

.logo-icon {
  margin: 10px 0;
}

img.logo-icon {
  height: 40px;
  width: 40px;
  filter: brightness(0) saturate(100%);
}

.instagram-icon {
  margin-right: 10px;
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

.header-container,
.footer-container {
  flex-shrink: 0;
}

.component-container {
  background-image: url('./assets/icons/web-container-background.png');
  background-size: cover;
  background-position: center;
  flex-grow: 1;
  padding-bottom: 80px;
  height: 100%;
  min-height: 75vh;
  margin: 0px;
  width: 100%;
}

/* Importaciones de tipografías */
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
</style>