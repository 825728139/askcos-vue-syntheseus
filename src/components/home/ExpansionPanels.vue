<template>
    <v-expansion-panels class="mb-2 text-body-1" :color="isDark ? 'grey-darken-3' : 'grey-lighten-3'">
        <v-expansion-panel :class="isDark ? 'bg-grey-darken-3' : 'bg-grey-lighten-3'" data-cy="home-support">
            <template v-slot:title>
                <v-icon class="mr-1">mdi mdi-lifebuoy</v-icon>
                <strong>Support</strong>
            </template>
            <template v-slot:text>
                If you have any questions or if any of the links/images appear
                broken, please email <a href="mailto:askcos_support@mit.edu"
                    class="text-decoration-none text-primary font-weight-medium d-inline-flex align-center">askcos_support@mit.edu</a>
            </template>
        </v-expansion-panel>
        <v-expansion-panel text='THIS SOFTWARE IS PROVIDED "AS IS" AND ANY EXPRESSED OR IMPLIED
            WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
            MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
            IN NO EVENT SHALL THE REGENTS OR CONTRIBUTORS BE LIABLE FOR ANY
            DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
            DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
            GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
            INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
            IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
            OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN
            IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE."' :class="isDark ? 'bg-grey-darken-3' : 'bg-grey-lighten-3'">
            <template v-slot:title>
                <v-icon class="mr-1">mdi-license</v-icon>
                <strong>License</strong>
            </template>
        </v-expansion-panel>
        <v-expansion-panel :class="isDark ? 'bg-grey-darken-3' : 'bg-grey-lighten-3'">
            <template v-slot:title>
                <v-icon class="mr-1">mdi-account-group</v-icon>
                <strong>Contributors</strong>
            </template>
            <template v-slot:text>
                <v-chip class="ma-1" v-for="person in contributorList">
                    <v-icon start icon="mdi-account"></v-icon>
                    <span class="text-body-1">{{ person }}</span>
                </v-chip>
            </template>
        </v-expansion-panel>
    </v-expansion-panels>
</template>

<script setup>
import { ref } from "vue";
import { useTheme } from "@/composables/useTheme";

const { isDark } = useTheme();

const contributorList = ref([
    "Zhenkgai Tu (Maintainer)",
    "Sourabh Choure (Maintainer)",
    "Max Liu",
    "Samuel Gong",
    "Mun Hong Fong",
    "Aaron Chen",
    "Tony Li",
    "Mike Fortunato",
    "Pritha Verma",
    "Thomas Struble",
    "David Graff",
    "Itai Levin",
    "Jiannan Liu",
    "Hanyu Gao",
    "Yunsie Chung",
    "Florence Vermeire",
    "Yiming Mo",
    "Thijs Stuyver",
    "Yanfei Guan",
    "Travis Nevins",
    "Joonyoung Joung",
    "Huiqian Lin",
    "Mark Murnin",
    "Connor Coley"
])
</script>