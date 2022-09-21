
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue'), meta: { title: "Principal"} },
      { path: '/usuarios', component: () => import('pages/Usuarios.vue'), name: 'Usuarios', meta: { title: "Usuarios"} },
      { path: '/polizas', component: () => import('pages/Polizas.vue'), name: 'Pólizas', meta: { title: "Pólizas"} },
      { path: '/clientes', component: () => import('pages/Clientes.vue'), name: 'Clientes', meta: { title: "Clientes"} },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  },
  {
    path: '/login',
    component: () => import('pages/Login.vue')
  }

]

export default routes
