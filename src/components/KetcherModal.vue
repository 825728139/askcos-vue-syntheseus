<template>
  <v-dialog v-model="propShow" :id="id" width="auto">
    <v-card>
      <v-card-text>
        <iframe ref="ketcherIframe" data-cy="ketcher-iframe" src="/ketcher/dist/ketcher.html" width="820px"
          height="460px"></iframe>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn data-cy="ketcher-Cancel-button" color="primary" @click="() => { propShow = false }">Cancel</v-btn>
        <v-btn data-cy="ketcher-Done-button" color="primary" @click="() => { smilesFromKetcher(); propShow = false }">Done</v-btn>
      </v-card-actions>
    </v-card>

  </v-dialog>
</template>

<script>
import { ref, watch, computed } from 'vue';
import { API } from "@/common/api";

export default {
  name: 'KetcherModal',
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    id: {
      type: String,
      default: 'ketcher-modal',
    },
    smiles: {
      type: String,
      default: ''
    },
  },
  setup(props, context) {
    const ketcherIframe = ref(null);
    // const ketcherSpinner = ref(null);

    const propShow = computed({
      get() {
        return props.value
      },
      set(newValue) {
        context.emit('input', newValue)
      },
    })

    const propSmiles = computed({
      get() {
        return props.smiles
      },
      set(newValue) {
        context.emit('update:smiles', newValue)
      },
    })

    watch(propShow, () => {
      smilesToKetcher();
    });

    const smilesToKetcher = () => {
      const km = ketcherIframe.value;
      // const spinner = ketcherSpinner.value;
      if (!(km && km.contentWindow.ketcher && km.contentWindow.ketcher.ready)) {
        // spinner.style.display = 'block';
        setTimeout(smilesToKetcher, 100);
        return;
      }
      const ketcher = km.contentWindow.ketcher;
      let molfileOld = ketcher.getMolfile();
      ketcher.editor.struct(null);
      // // spinner.style.display = 'block';

      if (!props.smiles) {
        // spinner.style.display = 'none';
        return;
      }
      API.post('/api/rdkit/to-molfile/', { 'smiles': props.smiles })
        .then(json => {
          ketcher.setMolecule(json.molfile);
          // spinner.style.display = 'none';
        })
        .catch(error => {
          console.error('Could not convert SMILES to molfile for Ketcher use: ' + error);
          ketcher.setMolecule(molfileOld);
          // spinner.style.display = 'none';
        });
    };

    const smilesFromKetcher = async () => {
      const km = ketcherIframe.value;
      const ketcher = km.contentWindow.ketcher;
      let smiles = ketcher.getSmiles()
      const json = await API.post('/api/rdkit/canonicalize/', { smiles: smiles });
      if (json.smiles) {
        context.emit('update:smiles', json.smiles);
      }
    };

    return {
      propShow,
      ketcherIframe,
      smilesToKetcher,
      smilesFromKetcher,
    };
  }
};
</script>


<style>
div.modal .modal-dialog.modal-fit {
  width: fit-content !important;
  max-width: 1000px !important;
}

#ketcher-iframe {
  border-width: 0;
}

#ketcher-spinner {
  position: absolute;
  z-index: 1;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  overflow: auto;
  margin: auto;
  width: 50px;
  height: 50px;
}
</style>