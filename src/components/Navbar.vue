<template>
  <nav class="navbar">
    <router-link class="nav-link" to="/">MÚSICA</router-link>
    <router-link class="nav-link" to="/ranking">RANKING</router-link>
    <router-link class="nav-link" to="/artists">ARTISTAS</router-link>
    <router-link class="nav-link" to="/faq">FAQ</router-link>
    <router-link class="nav-link" to="/about">NOSOTROS</router-link>
  </nav>
</template>

<script>

</script>

<style>
.navbar {
    background-color: black;
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 15px;
    text-align: center;
}

.nav-link {
    color: white;
    font-family: 'Raleway', sans-serif;
    letter-spacing: 0.15em;
    text-decoration: none;
    margin-right: 40px;
    font-size: 18px;
}

.nav-link:hover {
    transition: all .2s;
    transform: scale(1.1);
    filter: drop-shadow(0 0 7px rgb(114, 114, 114));
    color: gray;
}

</style>
