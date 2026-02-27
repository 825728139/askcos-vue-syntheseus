<template>
  <div>
    <v-btn color="red-darken-2" variant="flat" @click="showDesc = true" data-cy="ban-button">Ban</v-btn>
    <v-dialog v-model="showDesc" width="500px">
      <v-card :title="`Reason to ban this ${type}?`">
        <v-card-text data-cy="ban-description">
          <v-text-field v-model="desc" variant="outlined" hide-details label="Enter Description"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showDesc = false" variant="tonal" data-cy="ban-close-button">Close</v-btn>
          <v-btn @click="ban" variant="tonal" color="primary" data-cy="ban-confirm-button">Ban</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { API } from "@/common/api";
import dayjs from "dayjs";
import { useConfirm } from 'vuetify-use-dialog';
import { ref } from "vue";

export default {
  name: 'BanButton',
  props: {
    smiles: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: '',
    },
  },
  setup() {
    const createConfirm = useConfirm();
    const desc = ref("");
    const showDesc = ref(false)
    return {
      createConfirm,
      desc,
      showDesc
    }
  },
  methods: {
    async ban() {
      this.showDesc = false;
      const url = `/api/banlist/${this.type}s/post`
      const body = {
        smiles: this.smiles,
        description: this.desc,
      };
      try {
        const json = await API.post(url, body, true);
        const datetime = dayjs(json.created).format('MMMM D, YYYY h:mm A');
        const isConfirmed = await this.createConfirm({ title: 'Action Completed!', content: `Banned ${this.type} ${this.smiles} at ${datetime}`, dialogProps: { width: "auto" } })
        if (!isConfirmed)
          return
      } catch (error) {
        console.error(error);
        alert('Error banning')
      }
    },
  },
};
</script>
