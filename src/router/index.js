import { createRouter, createWebHistory } from "vue-router";
import { nextTick } from "vue";
// import NProgress from "nprogress";

const routes = [
  {
    path: "/commands",
    meta: { title: "Command" },
    component: () => import("@/views/parse/Parse.vue"),
  },
  {
    path: "/",
    component: () => import("@/layouts/default/Default.vue"),
    meta: { title: "Home" },
    children: [
      {
        path: "",
        name: "Home",
        component: () => import("@/views/Home.vue"),
      },
    ],
  },
  {
    path: "/network",
    component: () => import("@/layouts/default/Default.vue"),
    beforeEnter: (to) => {
      if (!isAuthenticated()) {
        return { name: "Login", query: { redirect: encodeURIComponent(to.fullPath) } };
      }
    },
    meta: { title: "Retrosynthesis" },
    children: [
      {
        path: "",
        name: "Interactive Path Planner",
        component: () => import("@/views/network/Network.vue"),
        query: { tab: "IPP" },
      },
      {
        path: "",
        name: "One-Step Retrosynthesis",
        component: () => import("@/views/network/Network.vue"),
        query: { tab: "RP" },
      },
      {
        path: "",
        name: "Tree Explorer",
        component: () => import("@/views/network/Network.vue"),
        query: { tab: "TE" },
      },
    ],
  },
  {
    path: "/status",
    component: () => import("@/layouts/default/Default.vue"),
    meta: { title: "Status" },
    children: [
      {
        path: "",
        name: "Server Status",
        component: () => import("@/views/status/Status.vue"),
      },
    ],
  },
  {
    path: "/buyables",
    component: () => import("@/layouts/default/Default.vue"),
    meta: { title: "Buyables" },
    children: [
      {
        path: "",
        name: "Buyables",
        component: () => import("@/views/buyables/Buyables.vue"),
      },
    ],
  },
  {
    path: "/results",
    component: () => import("@/layouts/default/Default.vue"),
    meta: { title: "Results" },
    beforeEnter: () => {
      if (!isAuthenticated()) return { name: "Login" };
    },
    children: [
      {
        path: "",
        name: "My Results",
        component: () => import("@/views/results/Results.vue"),
      },
    ],
  },
  {
    path: "/banlist",
    component: () => import("@/layouts/default/Default.vue"),
    meta: { title: "Banlist" },
    beforeEnter: () => {
      if (!isAuthenticated()) return { name: "Login" };
    },
    children: [
      {
        path: "",
        name: "My Banlist",
        component: () => import("@/views/banlist/Banlist.vue"),
      },
    ],
  },
  {
    path: "/forward",
    component: () => import("@/layouts/default/Default.vue"),
    meta: { title: "Forward Synthesis" },
    children: [
      {
        path: "",
        name: "Condition Recommendation",
        component: () => import("@/views/forward/Forward.vue"),
        query: { tab: "context" },
      },
      {
        path: "",
        name: "Product Prediction",
        component: () => import("@/views/forward/Forward.vue"),
        query: { tab: "forward" },
      },
      {
        path: "",
        name: "Impurity Prediction",
        component: () => import("@/views/forward/Forward.vue"),
        query: { tab: "impurity" },
      },
      {
        path: "",
        name: "Regioselectivity Prediction",
        component: () => import("@/views/forward/Forward.vue"),
        query: { tab: "selectivity" },
      },
      {
        path: "",
        name: "Aromatic C-H Functionalization",
        component: () => import("@/views/forward/Forward.vue"),
        query: { tab: "sites" },
      },
    ],
  },
  {
    path: "/solprop",
    component: () => import("@/layouts/default/Default.vue"),
    meta: { title: "Solubility Properties" },
    children: [
      {
        path: "",
        name: "Solubility Prediction",
        component: () => import("@/views/solprop/SolProp.vue"),
        query: { tab: "solpred" },
      },
      {
        path: "",
        name: "Solvent Screening",
        component: () => import("@/views/solprop/SolProp.vue"),
        query: { tab: "solscreen" },
      },
    ],
  },
  {
    path: "/qm",
    component: () => import("@/layouts/default/Default.vue"),
    meta: { title: "QM Descriptor" },
    children: [
      {
        path: "",
        name: "QM Descriptor",
        component: () => import("@/views/qm/QM.vue"),
      },
    ],
  },
  {
    path: "/molcom",
    component: () => import("@/layouts/default/Default.vue"),
    meta: { title: "Molecular Complexity" },
    children: [
      {
        path: "",
        name: "Molecular Complexity",
        component: () => import("@/views/molcom/MolCom.vue"),
      },
    ],
  },
  {
    path: '/api-docs',
    name: 'SwaggerDocs',
    beforeEnter() {
      const relativeSwaggerUrl = `${window.location.origin}/docs`;
      window.location.href = relativeSwaggerUrl;
    },
  },
  {
    path: "/:pathMatch(.*)*",
    meta: { title: "404" },
    component: () => import("@/layouts/default/Default.vue"),
    children: [
      {
        path: "",
        name: "NotFound",
        component: () => import("@/views/notfound/NotFound.vue"),
      },
    ],
  },
  {
    path: "/logs",
    meta: { title: "Logs" },
    component: () => import("@/layouts/default/Default.vue"),
    children: [
      {
        path: "",
        name: "Logs",
        component: () => import("@/views/logs/Logs.vue"),
      },
    ],
  },
  {
    path: "/drawing",
    meta: { title: "Drawing" },
    component: () => import("@/layouts/default/Default.vue"),
    children: [
      {
        path: "",
        name: "Drawing",
        component: () => import("@/views/drawing/Drawing.vue"),
      },
    ],
  },
  {
    path: "/template",
    meta: { title: "Template Info" },
    component: () => import("@/layouts/default/Default.vue"),
    children: [
      {
        path: "",
        name: "Template Info",
        component: () => import("@/views/template/Template.vue"),
      },
    ],
  },
  {
    name: "Admin Login",
    path: "/admin-login",
    meta: { title: "Admin Login" },
    component: () => import("@/views/login/AdminLogin.vue"),
  },
  {
    name: "SSO Login",
    path: "/sso-login",
    meta: { title: "SSO Login" },
    component: () => import("@/views/login/SSOLogin.vue"),
  },
  {
    name: "SSO Callback",
    path: "/sso-callback",
    meta: { title: "SSO Callback" },
    component: () => import("@/views/login/SSOCallback.vue"),
  },
  {
    name: "SSO Logout",
    path: "/sso-logout",
    meta: { title: "SSO Logout" },
    component: () => import("@/views/login/SSOLogout.vue"),
  },
  {
    name: "Login",
    path: "/login",
    meta: { title: "Login" },
    component: () => import("@/views/login/Login.vue"),
  },
  {
    path: "/admin",
    meta: { title: "Admin" },
    component: () => import("@/layouts/adminPanel/Index.vue"),
    children: [
      {
        path: "",
        name: "Admin Panel",
        component: () => import("@/views/admin/Admin.vue"),
      },
    ],
    beforeEnter: () => {
      if (!isAuthenticated()) return { name: "Admin Login" };
    },
  },
];

const isAuthenticated = () => !!localStorage.getItem("accessToken");

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeResolve((to) => {
  // eslint-disable-next-line no-undef
  if (to.name) NProgress.start();
});

router.afterEach(async (to) => {
  // eslint-disable-next-line no-undef
  NProgress.done();
  await nextTick();
  document.title = `${to.meta.title} - ASKCOS`;
});

router.beforeEach((_to, from) => {
  if (from.fullPath) localStorage.setItem("lastRoute", from.fullPath);
});

router.onError((err) => {
  if (
    err.message.includes("Failed to fetch dynamically imported module") ||
    err.message.includes("Importing a module script failed")
  ) {
    console.log(err);
    router.push({ name: 'Home' });
  }
});

export default router;
