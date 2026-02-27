<template>
  <v-main :class="backgroundColor">
    <router-view v-slot="{ Component }">
      <keep-alive exclude="Results,AppBar,Banlist">
        <component :is="Component" />
      </keep-alive>
    </router-view>
    <default-footer />
  </v-main>
</template>

<script setup>
import DefaultFooter from "./Footer.vue";
import { computed } from 'vue';
import { useTheme } from '@/composables/useTheme';
const { isDark } = useTheme();

const backgroundColor = computed(() => {
  return isDark.value ? '' : 'bg-grey-lighten-4';
});
</script>
