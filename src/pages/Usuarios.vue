<template>
  <q-page class="flex column">

    <div class="absolute-center" >
      <q-table
        class="q-ma-sm"
        :rows="rows"
        :columns="columns"
        row-key="id_usuario"
        :loading="loading"
        :filter="search"
        :pagination="initialPagination"
        @row-click="onRowClick"
      >
        <template v-slot:top>
          <span class="text-subtitle1">{{ `${txtPlural}: ${new Intl.NumberFormat().format(rows.length)}` }}</span>
          <q-space />
          <q-input dense debounce="300" v-model="search" placeholder="Buscar">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-space />
          <q-btn
            class="q-mt-sm"
            round
            color="positive"
            icon="mdi-plus"
            size="sm"
            @click="nuevoRegistro = true;dlgEditar = true; agregaRegistro()"
          >
            <q-tooltip anchor="top middle" self="bottom middle">Agregar {{ txtSingular }}</q-tooltip>
          </q-btn>
        </template>
      </q-table>
    </div>

    <q-dialog v-model="dlgEditar">
      <q-card :class="$q.dark.mode ? 'bg-dark' : '' " style="max-width:560px;">
        <q-card-section class="bg-primary">
          <div class="text-h6 text-light-blue-2">Información del {{ txtSingular }}</div>
        </q-card-section>
        <q-card-section>
          <q-form v-model="frmValid" @submit="onSubmit" @reset="onReset" class="q-gutter-md" ref="frmRegistro">
            <div class="row">
              <div class="col-2">
                <q-input
                  v-model="id_usuario"
                  label="Número"
                  color="blue-6"
                  outlined
                  mask="####"
                  fill-mask="0"
                  reverse-fill-mask
                  :readonly="true"
                />
              </div>
            </div>
            <div class="row inline">
              <div class="col-4">
                <q-input
                  v-model="usuario"
                  class="q-mr-md"
                  label="Usuario"
                  color="blue-6"
                  debounce="400"
                  :loading="loadingId"
                  @input="buscaRegistro()"
                  :error="computedError"
                  :error-message="errorMessage"
                  autofocus
                />
              </div>
              <div class="col-4">
                <q-input
                  v-model="password"
                  class="q-mr-md"
                  type="password"
                  label="Contraseña"
                  color="blue-6"
                  :disable="!nuevoRegistro"
                  :rules="[
                    v => (!!v && nuevoRegistro) || 'Campo obligatorio'
                  ]"
                />
              </div>
              <div class="col-4">
                <q-input
                  v-model="passwordConfirm"
                  type="password"
                  label="Confirmar Contraseña"
                  color="blue-6"
                  :disable="!nuevoRegistro"
                  :rules="[
                    v => (!!v && nuevoRegistro) || 'Campo obligatorio',
                    v => (v == password) || 'La contraseña no coincide'
                  ]"
                />
              </div>
            </div>
            <div class="row">
              <div class="col-8">
                <q-input
                  v-model="nombre"
                  class="q-mr-md"
                  color="info"
                  label="Nombre"
                  maxlength="45"
                  :rules="rules"
                />
              </div>
              <div class="col-4">
                <q-select
                  v-model="perfil"
                  color="info"
                  :options="perfiles"
                  option-value="id_perfil"
                  option-label="nombre"
                  label="Perfil"
                  :rules="[
                    v => !!v || 'Campo obligatorio'
                  ]"
                />
              </div>
            </div>
            <div class="row">
              <div class="col-9">
                <q-input
                  v-model="email"
                  class="q-mr-md"
                  color="info"
                  label="Email"
                  :rules="[
                    v => !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'Cuenta de correo incorrecta'
                  ]"
                />
              </div>
              <div class="col-3">
                <q-input
                  v-model="telefono"
                  color="info"
                  label="Teléfono"
                  maxlength="15"
                  mask="(###) ###-####"
                />
              </div>
            </div>

<!--
            <q-input v-model="paterno" label="Apellido Paterno" color="info" outlined maxlength="25" />
            <q-input v-model="materno" label="Apellido Materno" color="info" outlined maxlength="25" />
            <q-input v-model="celular" label="Tel. Celular" color="info" outlined maxlength="15" mask="(###) ###-####" /> -->

            <q-separator />
            <div class="row justify-between q-mt-md">
              <div class="col-3">
                <q-btn label="Regresar" @click="dlgEditar = false" />
              </div>
              <div class="col-auto">
                <q-btn type="submit" label="Guardar" color="primary" />
              </div>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script>
export default {
  //name: 'Usuarios',
  data() {
    return {
      txtSingular: 'Usuario',
      txtPlural: 'Usuarios',
      localData: {},
      id_usuario: '',
      usuario: '',
      password: '',
      passwordConfirm: '',
      nombre: '',
      email: '',
      telefono: '',
      perfil: {},
      perfiles: [],
      rulesId: [
        value => !!value || 'Campo obligatorio',
      ],
      rules: [
        value => !!value || 'Campo obligatorio',
        value => (value || '').length <= 25 || 'Máximo 25 caractéres',
      ],
      selected: [],
      singleSelect: false,
      loading: true,
      search: '',
      columns: [
        { name: 'numero', field: "id_usuario", label: "Número", sortable: true, align: "center" },
        { name: 'usuario', field: "usuario", label: "usuario", sortable: true, align: "left" },
        { name: "nombre", field: "nombre", label: 'Nombre', sortable: true, align: "left" },
        { name: "email", field: "email", label: 'E-mail', sortable: true, align: "left" },
        { name: "telefono", field: "telefono", label: 'Teléfono', sortable: true, align: "left" },
        { name: "perfil", field: "perfil", label: 'Perfil', sortable: true, align: "left" },
      ],
      rows: [],
      initialPagination: {
        sortBy: 'nombre',
        descending: false,
        page: 1,
        rowsPerPage: 15
        // rowsNumber: xx if getting data from a server
      },
      dlgEditar: false,
      nuevoRegistro: false,
      frmValid: false,
      loadingSave: false,
      loadingId : false,
      found: false,
      error: false,
      errorMessage: "",

    } // return data()
  }, // data()


  mounted() {
    this.getRecords()
    this.$axios({
      method: "get",
      url: "api/perfiles"
    }).then(resp => {
      this.perfiles = resp.data.results
    }).catch(err => {
      console.log("err", err)
    })
  },

  computed: {
    computedError() {
      if (this.usuario.length == 0) {
        this.errorMessage = "Campo obligatorio"
        return true
      } else if (this.found) {
        this.errorMessage = "El Usuario ya existe"
        return true
      } else {
        this.errorMessage = ""
        return false
      }
    }
  },

  methods: {

    getRecords() {
//      this.$q.loading.show()
      this.loading = true
      this.$axios(`/api/${this.txtPlural.toLowerCase()}`)
        .then(resp => {
          if (resp.data.result == 404) {
            this.$q.notify({
              color: "warning",
              message: 'Se detectó un inconveniente con la Base de Datos'
            })
          } else if (resp.data.result == 200) {
            this.rows = resp.data.results
          }
        })
        .catch(err => {
          console.log('Error al leer los registros', err)
          this.$q.notify({
            color: "warning",
            message: 'Se detectó un inconveniente con la Base de Datos ' + err
          })
        })
        .finally(() => {
          this.loading = false
//          this.$q.loading.hide()
        })
    },

    onRowClick(ev, item) {
      this.id_usuario = item.id_usuario
      this.usuario = item.usuario
      this.nombre = item.nombre
      this.email = item.email
      this.telefono = item.telefono
      this.perfil = this.perfiles.find( p => p.id_perfil == item.id_perfil)
      this.nuevoRegistro = false
      this.dlgEditar = true
    }, // onRowClick()

    buscaRegistro() {
      this.found = false
      if (this.usuario.length > 0) {
        let respuesta = false
        this.loadingId = true
        this.$axios(`/api/${this.txtPlural.toLowerCase()}/?usuario=${this.usuario}`)
          .then(resp => {
            if (resp.data.result == 200) {
              respuesta = true
              this.found = true
            } else if (resp.data.result == 404) {
              this.$q.notify({
                color: "orange-10",
                message: "Se detectó un inconveniente con la Base de Datos"
              })
            }
          })
          .catch(err => {
            console.log('Error al leer los registros', err)
            this.$q.notify({
              color: "orange-10",
              message: "Se detectó un inconveniente con la Base de Datos: " + err
            })
          })
          .finally(() => {
            this.loadingId = false
            this.found = respuesta
          })
      }

    }, // buscaRegistro()

    onSubmit() {
      this.$refs.frmRegistro.validate().then(success => {
        if (success) {
          this.loadingSave = true
          this.loading = true
          this.$axios({
            method: 'post',
            url: `/api/${this.txtSingular.toLowerCase()}_save`,
            data: {
              id_usuario: this.id_usuario,
              usuario: this.usuario,
              password: this.password,
              nombre: this.nombre,
              email: this.email,
              telefono: this.telefono,
              id_perfil: this.perfil.id_perfil,
              nuevoRegistro: this.nuevoRegistro
            }
          })
          .then(resp => {
            if (resp.data.result == 200)  {
              this.$q.notify({
                color: "positive",
                message: "Registro guardado correctamente"
              })
            } else if (resp.data.result == 404) {
              this.$q.notify({
                color: "error",
                message: "Se detectó un inconveniente con la Base de Datos " + resp.data.msg
              })
            }
          })
          .catch(err => {
            console.log('Error al actualizar el registro', err)
          })
          .finally(() => {
            this.dlgEditar = false
            this.loading = false
            this.nuevoRegistro = false
            this.loadingSave = false
            this.getRecords()
          })

        } else {
          this.$q.notify({
            color: "error",
            message: "No se ha capturado correctamente la información"
          })
        }
      })

    }, // onSubmit()

    onReset() {
    },

    agregaRegistro() {
      if (this.$refs.frmRegistro) {
        this.$refs.frmRegistro.resetValidation()
      }
      this.id_usuario = ''
      this.usuario = ''
      this.password = ''
      this.passwordConfirm = ''
      this.nombre = ''
      this.email = ''
      this.telefono = ''
      this.perfil = null
    }, // agregaRegistro()

  }, // methods

}
</script>
