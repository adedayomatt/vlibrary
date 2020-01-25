<template>
  <v-app>
    
    <NavBar />
    <v-content>
      <v-container>
        <router-view></router-view>
        <div class="text-center mt-5 text--grey"><small>Adedayo Matthews</small></div>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import NavBar from './components/NavBar'

export default {
  name: 'App',
  
  components: {
    NavBar
  },

  data: () => ({
    //
  }),
};
</script>
