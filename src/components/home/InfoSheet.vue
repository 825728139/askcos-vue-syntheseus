<template>
    <v-sheet elevation="2" rounded="lg" width="100%" class="pa-6">
        <v-container class="" fluid>
            <p class="font-weight-medium text-primary"><v-icon icon="mdi-trophy-award"
                    class="text-blue-darken-3"></v-icon>Newer, Faster, Better!</p>

            <p
                :class="'mt-2 text-h4 font-weight-bold text-sm-h4' + (isDark ? ' text-grey-lighten-2' : ' text-grey-darken-2')">
                About ASKCOS
            </p>

            <p class="mt-4 mb-6 text-body-1 text-justify">
                Here, we have hosted a number of computational tools to assist in
                synthetic planning and other aspects of organic chemistry. These are
                listed under the Modules tab in the navigation bar on the left, with
                more detailed description in
                <a class="text-decoration-none text-primary font-weight-medium d-inline-flex align-center"
                    target="_blank" href="https://askcos-docs.mit.edu/" color="primary">
                    ASKCOS wiki <v-icon size="x-small">mdi mdi-open-in-new</v-icon></a>.
                Several of the deployed models are described in publications listed
                <a class="text-decoration-none text-primary font-weight-medium d-inline-flex align-center"
                    target="_blank" href="https://mlpds.mit.edu/papers/">here<v-icon size="x-small">mdi
                        mdi-open-in-new</v-icon></a>.
                References for the models are included in their respective pages
                where appropriate.
            </p>

            <v-row justify="center">
                <v-col cols="12" lg="6" order="2" order-lg="1">
                    <expansion-panels />
                    <p class="mt-4 text-subtitle-2">Please review the <a
                            class="text-decoration-none text-primary font-weight-medium d-inline-flex align-center"
                            href="https://askcos-docs.mit.edu/guide/Privacy-&-Terms-of-Service/ASKCOS-Terms-of-Service.html"
                            target="_blank">Terms of Service <v-icon size="x-small">mdi mdi-open-in-new</v-icon></a>
                        before using
                        ASKCOS.</p>
                </v-col>

                <v-col cols="12" lg="5" offset-lg="1" order-lg="2">
                    <v-alert border="start" type="info" density="compact" text="Please keep in mind that this service is supported by a fixed amount
              of computational resources. Your requests may take significantly
              longer than expected if there are several other users on the site
              also performing computationally-expensive requests." variant="tonal"
                        class="mb-2 py-2 text-justify"></v-alert>
                    <v-alert border="start" density="compact" variant="tonal" icon="mdi mdi-handshake"
                        class="mb-2 text-justify">
                        <template v-slot:text class="text-body-1">
                            This work began under the DARPA Make-It program
                            (ARO W911NF-16-2-0023) and continues to be supported by the
                            <a class="text-decoration-none text-primary font-weight-medium d-inline-flex align-center"
                                target="_blank" href="https://mlpds.mit.edu">
                                Machine Learning for Pharmaceutical Discovery and Synthesis Consortium <v-icon
                                    size="x-small">mdi
                                    mdi-open-in-new</v-icon></a>,
                            and the National Institutes of Health (1U18TR004149-01).
                        </template>
                    </v-alert>
                </v-col>
            </v-row>
        </v-container>
    </v-sheet>
</template>

<script setup>
import ExpansionPanels from "@/components/home/ExpansionPanels"
import { useTheme } from "@/composables/useTheme";

const { isDark } = useTheme();
</script>