<template>
  <q-layout :class="(dark) ? 'fondoDark' : 'fondoLight'" view="lHh Lpr lFf" v-show="show">
    <q-header>
      <q-bar class="barra" dark>
        <q-btn
          flat
          round
          icon="menu"
          aria-label="Menu"
          @click="drawer = !drawer"
        >
          <q-tooltip>
            Abrir y Cerrar el Menú
          </q-tooltip>
        </q-btn>

        <q-toolbar-title>
          My Best Car Insurance
        </q-toolbar-title>

        <q-toolbar-title>
          {{ $route.meta.title }}
        </q-toolbar-title>

        <q-btn flat round icon="mdi-account" aria-label="Usuario">
          <q-tooltip anchor="center left" self="center right">Cambio de contraseña, Tema y Cierre de Sesión</q-tooltip>
          <q-menu transition-show="jump-down" transition-hide="jump-up" auto-close>
            <q-list style="min-width: 150px">
              <q-item clickable v-ripple @click="dialogPassword = true">
                <q-item-section avatar>
                  <q-icon name="mdi-form-textbox-password" />
                </q-item-section>
                <q-item-section>
                  Cambiar contraseña
                </q-item-section>
              </q-item>
              <q-item clickable v-ripple @click="cambiaTema">
                <q-item-section avatar>
                  <q-icon name="mdi-brightness-6" />
                </q-item-section>
                <q-item-section>
                  Cambiar de tema
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-ripple @click="logout()">
                <q-item-section avatar>
                  <q-icon name="mdi-power" />
                </q-item-section>
                <q-item-section>
                  Cerrar sesión
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

      </q-bar>
    </q-header>

    <q-drawer
      v-model="drawer"
      overlay
      :width="200"
      :breakpoint="500"
      content-class="bg-grey-10 text-blue-grey-2"
    >
      <!-- https://picsum.photos/200/300 -->
      <q-img class="absolute-top drawer-image" src="https://source.unsplash.com/800x600/?nature" />

      <q-scroll-area class="fit" >   <!--style="height: calc(100% - 10px); margin-top: 10px; border-right: 0px solid #ddd -->

<!--
        <div class="bg-transparent q-mx-sm q-mb-sm">

          <q-btn class="q-mr-lg" rounded flat icon="mdi-account-outline" size="lg" aria-label="Usuario">
            <q-menu transition-show="jump-down" transition-hide="jump-up" auto-close>
              <q-list style="min-width: 150px">
                <q-item clickable v-ripple @click="dialogPassword = true">
                  <q-item-section avatar>
                    <q-icon name="mdi-form-textbox-password" />
                  </q-item-section>
                  <q-item-section>
                    Cambiar contraseña
                  </q-item-section>
                </q-item>
                <q-item clickable v-ripple @click="cambiaTema">
                  <q-item-section avatar>
                    <q-icon name="mdi-brightness-6" />
                  </q-item-section>
                  <q-item-section>
                    Cambiar de tema
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-ripple @click="logout()">
                  <q-item-section avatar>
                    <q-icon name="mdi-power" />
                  </q-item-section>
                  <q-item-section>
                    Cerrar sesión
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <q-btn class="q-ml-md" rounded flat icon="mdi-home-outline" size="lg" aria-label="Home" to="/">
            <q-tooltip>Ir a Inicio</q-tooltip>
          </q-btn>
          <div class="text-caption flex justify-center">{{ usuario }}</div>
        </div>

        <q-separator dark />
-->
        <div class="row justify-space-between q-mx-sm">
          <q-btn
            flat
            round
            icon="menu"
            aria-label="Menu"
            dense
            @click="drawer = !drawer"
          >
            <q-tooltip>
              Abrir y Cerrar el Menú
            </q-tooltip>
          </q-btn>

          <q-space />

          <q-btn
            flat
            round
            icon="home"
            aria-label="Home"
            dense
            to="/"
            @click="drawer = (drawer) ? false : drawer"
          >
            <q-tooltip>
              Página principal
            </q-tooltip>
          </q-btn>
        </div>

        <q-separator dark />

        <q-list>
          <q-item clickable v-ripple to="/polizas" active-class="text-blue-3">
            <q-item-section avatar>
              <q-icon name="description" />
            </q-item-section>
            <q-item-section>Pólizas</q-item-section>
          </q-item>
        </q-list>

        <q-expansion-item :content-inset-level="0.5" expand-separator icon="contact_page" label="Catálogos">
          <q-list dense>
            <q-item clickable v-ripple to="/clientes" active-class="text-blue-3">
              <q-item-section avatar>
                <q-icon name="mdi-account-tie" />
              </q-item-section>
              <q-item-section>Clientes</q-item-section>
            </q-item>
            <!-- <q-separator /> -->
            <q-item clickable v-ripple to="/usuarios" active-class="text-blue-3">
              <q-item-section avatar>
                <q-icon name="mdi-account-group" />
              </q-item-section>
              <q-item-section>Usuarios</q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>

      </q-scroll-area>

    </q-drawer>

    <q-footer>
      <q-bar class="bg-primary justify-center" dark>
        <div>
          My Best Car Insurance &copy; 2021 - {{ new Date().getFullYear() }}
        </div>
      </q-bar>
    </q-footer>

    <q-page-container>
      <!-- <transition enter-active-class="animated fadeIn" leave-active-class="animated fadeOut" appear :duration="300"> -->
        <!-- <router-view /> -->
      <!-- </transition> -->
      <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in" :duration="300">
              <component :is="Component" />
          </transition>
      </router-view>
    </q-page-container>

    <!-- Dialogo para cambiar la contraseña -->
    <q-dialog v-model="dialogPassword" max-width="300px">

      <q-card>
        <q-form ref="frm" v-model="validForm" @submit.prevent.stop="onSubmit" class="q-gutter-md">
          <q-card-section>
            <!-- <span class="text-h5">{{ localData.nombre }}</span> -->
            <br>
            <span class="text-h6">Cambio de Contraseña</span>
          </q-card-section>
          <q-card-section>
            <div class="row">
              <div class="col" cols="12">
                <q-input
                  v-model="password.actual"
                  label="Contraseña actual*"
                  type="password"
                  :rules = "rulesActual"
                  color="blue-6"
                  autofocus
                ></q-input>
              </div>
            </div>
            <div class="row">
              <div class="col" cols="12">
                <q-input
                  v-model="password.nueva"
                  label="Nueva contraseña*"
                  type="password"
                  :rules = "rules"
                  color="blue-6"
                ></q-input>
              </div>
            </div>
            <div class="row">
              <div class="col" cols="12">
                <q-input
                  v-model="password.confirma"
                  label="Confirmar contraseña*"
                  type="password"
                  :rules = "rulesConfirma"
                  :hint = "password.nueva == password.confirma ? '' : 'Las contraseñas no coinciden'"
                  color="blue-6"
                ></q-input>
              </div>
            </div>
            <small>*Campos requeridos</small>
          </q-card-section>
          <q-card-actions align="right">
            <q-separator />
            <q-btn color="default" label="Regresar" flat @click="dialogPassword = false" />
            <q-btn
              type="submit"
              color="blue-6"
              label="Actualizar"
              flat
              :loading="loading"
              :disabled="(sha(password.actual) !== password.password) || (password.nueva.length == 0) || (password.nueva != password.confirma)"
              @click="onSubmit"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

  </q-layout>
</template>

<script>
  import Sha1 from 'sha1'
  export default {
    name: 'MainLayout',
    data () {
      return {
        ruta: "Principal",
        show: false,
        drawer: false,
        miniState: true,
        userId: "Usuario",
        usuario: 'Usuario',
        localData: null,
        dialogPassword: false,
        validForm: false,
        loading: false,
        password: {
          password: '',
          actual: '',
          nueva: '',
          confirma: '',
        },
        rulesActual: [
          value => Sha1(value) == this.password.password || 'Contraseña incorrecta'
        ],
        rules: [
          value => !!value || 'Campo obligatorio',
          value => (value || '').length <= 20 || 'Máximo 20 caractéres',
          value => (value || '').length >= 6 || 'Mínimo 6 caractéres',
        ],
        rulesConfirma: [
          value => !!value || 'Campo obligatorio',
          value => value === this.password.nueva || 'Las contraseñas no coinciden'
        ],
        dark: false,
        sha: Sha1,
      } // return (data)
    }, // data()
/*
    asyncData({isDev, route, store, env, params, query, req, res, redirect, error}) {
      let localData = undefined
      if (localStorage.data) {
        localData = JSON.parse(localStorage.data)
      }
console.log("localData", localData)
      if (!localData || localData == undefined) {
        redirect("/login")
        return
      }
      return {
        localData: localData,
      }
    },
*/
    beforeMount() {
      if (localStorage.data == undefined || !localStorage.data || localStorage.userId == undefined) {
        this.$router.replace("/login")
        return
      }
      this.show = true
      this.localData = JSON.parse(localStorage.data)
      this.userId = this.localData.userId
      this.usuario = this.localData.nombre
      this.getPass()
    },

    created () {
    },

    mounted() {
      if (localStorage && localStorage.tema) {
        this.dark = (localStorage.tema == "true")
      }
      this.$q.dark.set(this.dark)
    },

    methods: {
      logout() {
        localStorage.removeItem('data')
        localStorage.removeItem('dataAdmin')
        this.$router.replace("/login")
      }, // logout()

      async getPass() {
        let result = await this.$axios({
          url: `/api/pass/?userId=${localStorage.userId}`,
          method: 'post'
        })
        this.password.password = await result.data.results.password
      },

      onSubmit () {
        this.loading = true
        this.$refs.frm.validate()
          .then(valid => {
            console.log('then', valid)
            if (valid) {
              this.$q.loading.show()
              this.$axios({
                method: 'post',
                url: '/api/update_pass',
                data: {
                  usuario: this.localData.userId,
                  pass: Sha1(this.password.nueva)
                }
              })
              .then(resp => {
                this.$q.notify({
                  color: 'positive',
                  message: resp.data.msg
                })
              })
              .catch( err => {
                this.$q.notify({
                  color: 'warning',
                  message: err
                })
              })
              .finally( () => {
                this.loading = false
                this.dialogPassword = false
                this.$q.loading.hide()
                this.password.actual = ''
                this.password.nueva = ''
                this.password.confirma = ''
                this.getPass()
              })
            }
          })

      }, // onSubmit()

      cambiaTema() {
        this.dark = !this.dark
        this.$q.dark.set(this.dark)
        localStorage.tema = this.dark.toString()
      }, // cambiaTema()

    }, // methods
  }
</script>
<style lang="sass" scoped>
  .fondoDark
    background: rgb(24, 24, 24)
  .fondoLight
    background: rgb(230, 230, 230)
  .drawer-image
    height: 100%
    opacity: 0.2

  .fade-enter-active,
  .fade-leave-active
    transition: opacity 1.5s ease

  .fade-enter-from,
  .fade-leave-to
    opacity: 0

  .slide-enter-active,
  .slide-leave-active
    transition: all 1.5s ease-out

  .slide-enter-to
    position: absolute
    right: 0

  .slide-enter-from
    position: absolute
    right: -100%

  .slide-leave-to
    position: absolute
    left: -100%

  .slide-leave-from
    position: absolute
    left: 0

  .barra
    //background-image: linear-gradient( 63.1deg,  rgba(5,23,111,1) 16.4%, rgba(24,95,240,1) 64.5% )
    background-image: radial-gradient( circle farthest-corner at 16.5% 28.1%,  rgba(15,27,49,1) 0%, rgba(0,112,218,1) 90% )

</style>
