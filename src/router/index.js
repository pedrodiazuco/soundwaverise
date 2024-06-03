import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store/authStore';

import HomeView from '../views/HomeView.vue';
import ArtistsView from '../views/nav/ArtistsView.vue';
import AboutView from '../views/nav/AboutView.vue';
import FAQView from '../views/nav/FAQView.vue';
import RankingView from '../views/nav/RankingView.vue';
import SingInView from '../views/auth/SingInView.vue';
import SingUpView from '../views/auth/SingUpView.vue';
import SetProfileView from '../views/user/SetProfileView.vue'
import MyProfileView from '../views/user/MyProfileView.vue';
import ProfileArtistView from '../views/complement/ProfileArtistView.vue';
import ProfileTrackView from '../views/complement/ProfileTrackView.vue';
import UploadTrackView from '../views/user/UploadTrackView.vue'

const routes = [
  {path: '/', name: 'Home', component: HomeView},
  {path: '/artists', name: 'Artists', component: ArtistsView},
  {path: '/ranking', name: 'Ranking', component: RankingView},
  {path: '/about', name: 'About', component: AboutView},
  {path: '/FAQ', name: 'FAQ', component: FAQView},
  {path: '/signIn', name: 'Sign In', component: SingInView},
  {path: '/signUp', name: 'Sign Up', component: SingUpView},
  {path: '/:nickname', name: 'My Profile', component: MyProfileView, meta: { requiresAuth: true }},
  {path: '/setProfile/:nickname', name: 'Set Profile', component: SetProfileView, meta: { requiresAuth: true }},
  {path: '/profile/:nickname', name: 'Profile Artist', component: ProfileArtistView},
  {path: '/track/:title', name: 'Profile Track', component: ProfileTrackView},
  {path: '/uploadTrack', name: 'Upload Track', component: UploadTrackView, meta: { requiresAuth: true }},
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = !!authStore.currentUser;
  // Si la ruta requiere autenticación y el usuario no está autenticado, redirigir a Iniciar sesión
  if (to.meta.requiresAuth && !isAuthenticated) {
    authStore.requireAuth();
    next({ name: 'Sign In' });
  }
  // Si el usuario está autenticado y la ruta es sólo para usuarios no autenticados, redirigir al Perfil
  else if ((to.name === 'Sign In' || to.name === 'Sign Up') && isAuthenticated) {
    next({ name: 'My Profile', params: { nickname: authStore.currentUser.nickname } });
  }
  else {
    next();
  }
});

export default router;