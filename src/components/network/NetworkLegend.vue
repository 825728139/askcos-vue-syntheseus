<template>
  <div>
    <v-btn :class="expanded ? 'expand-toggle expand-parent-btn' : 'expand-toggle expand-parent'" size="small"
      variant="outlined" @click="expanded = !expanded">
      {{ expanded ? "Hide" : "Show" }} Legend
      <i v-if="expanded" class="fas fa-angle-down"></i>
      <i v-else class="fas fa-angle-up"></i>
    </v-btn>
    <div class="expand-parent">
      <div class="expand-content" :class="{ expanded: expanded }">
        <table>
          <thead>
            <tr>
              <th colspan="2">Border Colors</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span class="mdi mdi-square-outline mx-2 text-blue"></span></td>
              <td>Target molecule</td>
            </tr>
            <tr>
              <td><span class="mdi mdi-square-outline mx-2 text-green"></span></td>
              <td>Buyable, has chemical history</td>
            </tr>
            <tr>
              <td><span class="mdi mdi-square-outline mx-2 text-yellow"></span></td>
              <td>Buyable, no chemical history</td>
            </tr>
            <tr>
              <td><span class="mdi mdi-square-outline mx-2 text-orange"></span></td>
              <td>Not buyable, has chemical history</td>
            </tr>
            <tr>
              <td><span class="mdi mdi-square-outline mx-2 text-red"></span></td>
              <td>Not buyable, no chemical history</td>
            </tr>
          </tbody>
        </table>
        <table>
          <thead>
            <tr>
              <th colspan="2">Annotation Icons</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span class="mdi mdi-circle-outline mx-2 text-primary"></span></td>
              <td>Has property</td>
            </tr>
            <tr>
              <td><span class="mdi mdi-cancel mx-2 text-red"></span></td>
              <td>Does not have property</td>
            </tr>
            <tr>
              <td class="text-center">$</td>
              <td>Whether chemical is buyable</td>
            </tr>
            <tr>
              <td class="text-center">R</td>
              <td>Whether chemical has history as reactant</td>
            </tr>
            <tr>
              <td class="text-center">P</td>
              <td>Whether chemical has history as product</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { useTheme } from "@/composables/useTheme";

export default {
  name: "NetworkLegend",
  setup() {
    const expanded = ref(false);
    const { isDark } = useTheme();
    const backgroundColor = computed(() => {
      return isDark.value ? 'rgba(48, 48, 48, 0.8)' : 'rgba(255, 255, 255, 0.8)';
    });

    return {
      expanded,
      backgroundColor
    };
  },
};
</script>

<style scoped>
.expand-parent {
  position: absolute;
  bottom: 1px;
  left: 1px;
  overflow: hidden;
  transition: 0.5s ease;
}

.expand-parent-btn {
  position: absolute;
  bottom: 12rem;
  left: 1px;
  overflow: hidden;
  transition: 0.5s ease;
}

.expand-toggle {
  width: 10rem;
  margin: 0.5rem;
}

.expand-content {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  height: 12rem;
  padding: 0.5rem;
  background-color: v-bind(backgroundColor);
  margin-bottom: -12rem;
  transition: all 0.5s;
}

.expand-content.expanded {
  margin-bottom: 0;
}

.blue {
  color: #1965b0;
}

.green {
  color: #4eb265;
}

.yellow {
  color: #f6c141;
}

.orange {
  color: #e8601c;
}

.red {
  color: #dc050c;
}
</style>