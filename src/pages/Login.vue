<template>
  <q-layout class="bg-image" v-cloak>
    <q-page-container>
      <q-page class="flex flex-center">
        <!--<q-card class="login-form" v-bind:style="$q.platform.is.mobile?{'width': '60%'}:{'width':'20%'}">  -->
        <q-card style="background-color: rgba(255,255,255,0.9)">
          <img src="logo.jpg" class="q-mb-lg" spinner-color="primary" style="height: 100px; max-width: 300px;" />

          <q-form
            v-model="frm"
            @submit.prevent.stop="onSubmit"
            @reset.prevent.stop="onReset"
            class="q-gutter-md"
            name="fmr"
            ref="frm"
          >
            <q-card-section class="q-mt-md" >
              <div class="text-h5 text-center text-grey-15 q-mb-md">
                <q-icon name="lock" />
                Acceso
              </div>
              <q-input v-model="userId" type="text" label="Usuario" :rules="rules" autofocus>
                <template v-slot:before>
                  <q-icon name="person" />
                </template>
              </q-input>
              <q-input v-model="password" :type="isPwd ? 'password' : 'text'" label="Contraseña" :rules="rules">
                <template v-slot:before>
                  <q-icon name="vpn_key" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="isPwd ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer text-primary"
                    @click="isPwd = !isPwd"
                  />
                </template>
              </q-input>
            </q-card-section>
            <q-card-actions align="around">
              <q-btn flat label="Recuperar contraseña" no-caps color="primary" />
              <q-btn type="submit" color="primary" icon="check" label="Continuar" no-caps :loading="loading" />
            </q-card-actions>
          </q-form>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: "LockScreen",
  data() {
    return {
      frm: false,
      userId: '',
      password: '',
      isPwd: 'password',
      rules: [
        val => !!val || 'Valor requerido'
      ],
      loading: false,
      localData: {},
    }
  },

  async asyncData({isDev, route, store, env, params, query, req, res, redirect, error, $axios}) {
    let localData = {}
    if (localStorage.data) {
      localData = JSON.parse(localStorage.data)
    }
    if (localData.logged && localData.userId != undefined) {
      localStorage.userId = localData.userId
      redirect("/")
      return
    }
    //return { userId: 'oscar' }
  },

  beforeMount() {
    this.$q.dark.set(false)
  },

  mounted() {
    if (localStorage.userId) {
      this.userId = localStorage.userId
    }
  },

  methods: {
    onSubmit() {
      this.$refs.frm.validate()
        .then(valid => {
          this.loading = false
          if (valid) {
            this.login()
          }
        })
    }, // onSubmit()

    onReset() {
      // Nada en particular
    },

    login() {
      this.loading = true
      this.$axios({
        method: 'post',
        url: '/api/login',
        data: {
          userId: this.userId,
          password: this.password
        }
      }).then( response => {
        if (response.data.result == 500) {
          this.$q.notify({
            color: 'warning',
            message: `Usuario y/o Contraseña Inexistentes`
          })
        } else if (response.data.result == 200) {
          localStorage.userId = this.userId
          this.userName = response.data.results[0].nombre
          if (this.step == 1) {
            this.step = 2
          } else {
            this.$q.notify({
              color: 'positive',
              message: `Bienvenid@ ${this.userId}...`
            })
            localStorage.data = JSON.stringify({
              logged: true,
              id: this.userId,
              id_usuario: response.data.results[0].id_usuario,
              userId: this.userId,
              nombre: response.data.results[0].nombre,
              email: response.data.results[0].email,
              perfil: response.data.results[0].perfil
            })
            this.$router.replace("/")
          }
        } else if (response.data.result == 404) {
          response.data.msg
          this.$q.notify({
            color: 'warning',
            message: "Error de comunicación con la Base de Datos: " + response.data.msg.parent.sqlMessage
          })

        } else {
          this.$q.notify({
            color: 'warning',
            message: "Se detectó un problema de comunicación con la Base de Datos"
          })
        }
      }).catch( response => {
        console.log('Error:', response)
        this.$q.notify({
          color: "warning",
          message: "Se detectó un inconveniente: " + response
        })
      }).finally( () => {
        this.loading = false
      })
    }, // login()

  },
}

</script>

<style>
  .bg-image {
    background-image: url("~assets/background.jpg");
    background-repeat: no-repeat;
    background-size: cover;
    opacity: 0.9;
    filter: grayscale(50%);
  }

  [v-cloak] {
    display: none !important;
  }
</style>
