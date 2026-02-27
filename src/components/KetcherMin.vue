<template>
    <div>
        <iframe ref="ketcherIframeMin" id="ketcher-iframe-min" src="/ketcher/dist/ketcher_min.html" width="160"
            height="100"></iframe>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { API } from "@/common/api";

export default {
    name: 'KetcherMin',
    props: {
        smiles: {
            type: String,
            default: ''
        },
    },
    setup(props, context) {
        const ketcherIframeMin = ref(null);
        const ketcherIframeMinSpinner = ref(null);
        const isLoading = ref(false);

        const setSmiles = (smiles, reference, callback) => {
            const data = { smiles };
            if (reference) {
                data['reference'] = reference;
            }
            isLoading.value = true;
            API.post('/api/rdkit/to-molfile/', data)
                .then(json => {
                    setMolfile(json.molfile, callback);
                })
                .catch(error => {
                    console.error('Could not convert SMILES to molfile for Ketcher use: ' + error);
                })
                .finally(() => {
                    isLoading.value = false;
                });
        };

        const setMolfile = (molfile, callback) => {
            const km = ketcherIframeMin.value;
            if (!(km && km.contentWindow.ketcher && km.contentWindow.ketcher.ready)) {
                setTimeout(() => setMolfile(molfile, callback), 100);
                return;
            }
            const ketcher = km.contentWindow.ketcher;

            // Remove mousemove handler to prevent dragging atoms and bonds
            ketcher.editor.event.mousemove.handlers.length = 0;

            function resizeKetcherIframe() {
                const scale = 40; // 40's a bit of a magic number; I think it comes from a scale factor in Ketcher.
                const zoom = 0.8; // Based on what size looks good in the UI
                const margin = 1.5 * scale * zoom; // Based on testing to avoid cutoff along right and bottom edges
                const offset = -0.2 * scale * zoom; // Based on testing to avoid cutoff along left and top edges

                // Zoom out slightly so the molecule doesn't take up too much space
                ketcher.editor.zoom(zoom);

                const vbox = ketcher.editor.render.ctab.getVBoxObj();
                const vboxWidth = vbox.p1.x - vbox.p0.x;
                const vboxHeight = vbox.p1.y - vbox.p0.y;
                const baseWidth = Math.ceil(vboxWidth * scale * zoom);
                const baseHeight = Math.ceil(vboxHeight * scale * zoom);

                // The nodes used to render the Ketcher canvas are like this:
                // iframe --> div[role=application] --> main[role=application] --> svg
                // Scrolling is prevented happens if their sizes are all in non-increasing order.
                // The svg's size is dynamically calculated,
                // I think it's always 20x20 smaller than main[role=application].
                km.width = baseWidth + margin;
                km.height = baseHeight + margin;

                const ketcherDivApplication = km.contentWindow.document.querySelector('div[role=application]');
                if (ketcherDivApplication) {
                    ketcherDivApplication.style.width = (baseWidth + margin) + "px";
                    ketcherDivApplication.style.height = (baseHeight + margin) + "px";
                }

                const ketcherMainApplication = km.contentWindow.document.querySelector('main[role=application]');
                if (ketcherMainApplication) {
                    ketcherMainApplication.style.width = (baseWidth + margin) + "px";
                    ketcherMainApplication.style.height = (baseHeight + margin) + "px";
                }


                // Move canvas slightly so highlight circles do not get cut off along the top and left edges
                ketcher.editor.render.setScrollOffset(offset, offset);
                if (callback) {
                    callback(ketcher);
                }
            }
            // Need callback because the molecule takes a bit of time to finish displaying,
            // and we can't properly get coordinates  / bounding boxes until that finishes.
            ketcher.setMolecule(molfile, { callback: resizeKetcherIframe });

            km.contentWindow.scrollTo(0, 0)

            // Hook a click listener to refresh the filtered results when the atom selection is changes.
            if (!km.contentWindow.document.onclick) {
                km.contentWindow.document.onclick = () => {
                    let selection = getSelectedAtoms()
                    context.emit('change', selection)
                }
            }

            // if (spinner && spinner.value) {
            //     spinner.value.style.display = 'none';
            // }
        };

        const getSelectedAtoms = () => {
            let selectedAtoms = [];
            const km = ketcherIframeMin.value;
            if (!!km && !!km.contentWindow.ketcher) {
                let selection = km.contentWindow.ketcher.editor.selection();
                if (selection && selection.atoms) {
                    selectedAtoms = Array.from(selection.atoms.values());
                }
            }
            return selectedAtoms;
        };

        onMounted(() => {
            setSmiles(props.smiles);
        });

        return {
            ketcherIframeMin,
            ketcherIframeMinSpinner,
            isLoading,
            setSmiles,
            setMolfile,
            getSelectedAtoms
        };
    },
};
</script>

<style>
#ketcher-iframe-min {
    border-width: 0;
    overflow: hidden;
}

#ketcher-iframe-min-spinner {
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