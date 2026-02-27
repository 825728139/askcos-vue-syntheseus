<template>
    <v-row class="justify-center" v-if="fastapiStore.logs.length !== 0">
        <v-col cols="12" md="12" lg="12" xl="10" class="d-flex align-center justify-center">
            <v-select v-model="selectedMethod" :items="methods" label="Filter by Method" class="mb-3"
                @update:modelValue="filterLogs" clearable></v-select>
            <v-btn @click="clearLogs" color="red" class="mb-3">Clear All Results</v-btn>
        </v-col>
    </v-row>
    <v-row class="justify-center">
        <v-col cols="12" md="12" lg="12" xl="10" class="d-flex align-center justify-center">
            <v-expansion-panels multiple density="compact" v-if="filteredLogs.length !== 0" v-model="logsOpened">
                <v-expansion-panel v-for="(log, index) in filteredLogs" :key="index" density="compact">
                    <template v-slot:title>
                        <v-chip :color="methodToColors[log.method]">{{ log.method }}</v-chip> <span
                            class="text-body-1 ml-2"><b>{{
        log.endpoint }}</b></span>
                    </template>
                    <template v-slot:text>
                        <v-row>
                            <v-col>
                                <h6 class="text-h6">Request:</h6>
                                <pre
                                    style="white-space: pre-wrap">{{ log.request ? JSON.parse(log.request) : "No Request" }}</pre>
                            </v-col>
                            <v-col>
                                <h6 class="text-h6">Response:</h6>
                                <pre style="white-space: pre-wrap">{{ log.response || "No Response" }}</pre>
                            </v-col>
                        </v-row>
                    </template>
                </v-expansion-panel>
            </v-expansion-panels>
            <div v-else class="text-center">
                <v-img :width="400" cover :src="emptyLogsSrc" class="mb-3"></v-img>
                <h6 class="text-h6">Nothing to log</h6>
                <p class="text-body-1">Explore ASKCOS to record FastAPI requests/response</p>
            </div>
        </v-col>
    </v-row>
</template>

<script setup>
import { ref, watch } from "vue"
import { useFastapiStore } from "@/store/fastapi"
import emptyLogs from "@/assets/emptyLogs.svg"

const fastapiStore = useFastapiStore();

const methodToColors = ref({
    GET: "blue",
    POST: "green"
})
const emptyLogsSrc = ref(emptyLogs)
const logsOpened = ref([])
const selectedMethod = ref(null)
const methods = ref(["GET", "POST"])
const filteredLogs = ref(fastapiStore.logs)

const filterLogs = () => {
    if (selectedMethod.value) {
        filteredLogs.value = fastapiStore.logs.filter(log => log.method === selectedMethod.value);
    } else {
        filteredLogs.value = fastapiStore.logs;
    }
}

const clearLogs = () => {
    fastapiStore.clearLogs()
    selectedMethod.value = null
    filteredLogs.value = fastapiStore.logs
}

watch(fastapiStore.logs, () => {
    logsOpened.value = Array.from(logsOpened.value, x => ++x);
    filterLogs()
})
</script>