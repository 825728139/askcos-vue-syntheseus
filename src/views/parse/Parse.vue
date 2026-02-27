<template>
    Redirecting to ASKCOS...
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
import { onMounted } from "vue";
import { commands } from "@/views/parse/commands"

const route = useRoute();
const router = useRouter();

onMounted(() => {
    let urlParams = route.query;
    const commandParams = urlParams.search.split(" ");
    const command = commandParams[0].toLowerCase();
    if (command in commands) {
        const commandStruct = commands[command];
        if (commandStruct.params && commandStruct.params === commandParams.length) {

        } else {
            router.push({ path: commandStruct.path, query: { ...(commandStruct.tab && { tab: commandStruct.tab }) } })
        }
    }
});
</script>
