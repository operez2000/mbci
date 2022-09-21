<template>
  <q-page class="flex column">

    <div class="absolute-center" >
      <q-table
        class="q-ma-sm"
        :rows="rows"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :filter="search"
        dense
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
      <q-card :class="$q.dark.mode ? 'bg-dark' : '' " style="max-width:6200px;">
        <q-card-section class="bg-primary">
          <div class="text-h6 text-light-blue-2">Información del {{ txtSingular }}</div>
        </q-card-section>
        <q-card-section>
          <q-form v-model="frmValid" @submit="onSubmit" @reset="onReset" class="q-gutter-md" ref="frmRegistro">
            <div class="row">
              <div class="col-4">
                <q-input
                  v-model="id"
                  label="Número"
                  color="blue-6"
                  outlined
                  mask="#######"
                  fill-mask="0"
                  reverse-fill-mask
                  :readonly="true"
                />
              </div>
            </div>
            <div class="row">
              <div class="col-12">
                <q-input
                  v-model="nombreCompleto"
                  class="q-mr-md"
                  label="Nombre del Cliente"
                  color="blue-6"
                  debounce="400"
                  :loading="loadingId"
                  @input="buscaRegistro()"
                  :error="computedError"
                  :error-message="errorMessage"
                  autofocus
                />
              </div>
            </div>
            <div class="row">
              <div class="col-8">
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
              <div class="col-4">
                <q-input
                  v-model="telefono1"
                  color="info"
                  label="Teléfono"
                  maxlength="15"
                  mask="(###) ###-####"
                />
              </div>
            </div>
            <div class="row">
              <div class="col-12 q-gutter-md">
                <q-radio v-model="pais" val="us" label="US +1" />
                <q-radio v-model="pais" val="mx" label="México +52" />
              </div>
            </div>
            <q-separator />
            <div class="row justify-between q-mt-md">
              <div class="col-3">
                <q-btn label="Regresar" @click="dlgEditar = false" no-caps/>
              </div>
              <div class="col-3">
                <q-btn
                  label="Borrar"
                  color="negative"
                  no-caps
                  :disable="nuevoRegistro"
                  @click="borrarRegistro()"
                  :loading="loadingDelete"
                />
              </div>
              <div class="col-auto">
                <q-btn type="submit" label="Guardar" color="primary" no-caps />
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
  //name: 'Clientes',
  data() {
    return {
      txtSingular: 'Cliente',
      txtPlural: 'Clientes',
      id: '',
      nombreCompleto: '',
      email: '',
      telefono1: '',
      pais: 'us',
      rulesId: [
        value => !!value || 'Campo obligatorio',
      ],
      rules: [
        value => !!value || 'Campo obligatorio',
        value => (value || '').length <= 25 || 'Máximo 25 caractéres',
      ],
      loading: true,
      search: '',
      columns: [
        { name: 'numero', field: "id", label: "Número", sortable: true, align: "center" },
        { name: 'nombreCompleto', field: "nombreCompleto", label: "Nombre del Cliente", sortable: true, align: "left" },
        { name: "email", field: "email", label: 'E-mail', sortable: true, align: "left" },
        { name: "telefono1", field: "telefono1", label: 'Teléfono', sortable: true, align: "left" },
        { name: "pais", field: "pais", label: 'País', sortable: true, align: "left" },
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
      loadingDelete: false,
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
      if (this.nombreCompleto.length == 0) {
        this.errorMessage = "Campo obligatorio"
        return true
      } else if (this.found) {
        this.errorMessage = `El ${this.txtSingular} ya existe"`
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
      this.$axios({
        url: `/api/${this.txtPlural.toLowerCase()}`,
        method: "get"
        }).then(resp => {
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
      this.id = item.id
      this.nombreCompleto = item.nombreCompleto
      this.email = item.email
      this.telefono1 = item.telefono1
      this.pais = item.pais
      this.nuevoRegistro = false
      this.dlgEditar = true
    }, // onRowClick()

    buscaRegistro() {
      this.found = false
      if (this.nombreCompleto.length > 0) {
        let respuesta = false
        this.loadingId = true
        this.$axios({
          method: 'get',
          url: `/api/${this.txtPlural.toLowerCase()}/${this.id}`
          }).then(resp => {
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
            url: `/api/${this.txtSingular.toLowerCase()}`,
            data: {
              id: this.id,
              nombreCompleto: this.nombreCompleto,
              email: this.email,
              telefono1: this.telefono1,
              pais: this.pais,
              nuevoRegistro: this.nuevoRegistro
            }
          }).then(resp => {
            if (resp.data.result == 200)  {
              this.$q.notify({
                color: "positive",
                message: "Registro guardado correctamente"
              })
            } else {
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
      this.id = ''
      this.nombreCompleto = ''
      this.email = ''
      this.telefono1 = ''
      this.pais = 'us'
    }, // agregaRegistro()

    borrarRegistro() {
      this.$q.dialog({
        title: this.nombreCompleto,
        message: 'El registro se eliminará definitivamente',
        cancel: true,
        persistent: true,
        cancel: {
          label: "Regresar",
          color: "white",
          textColor: "primary",
          flat: true,
        }
      }).onOk(() => {
        this.loadingDelete = true
        this.$axios({
          method: "delete",
          url: `/api/cliente/${this.id}`
        }).then(resp => {
          this.$q.notify({
            message: resp.data.msg,
            color: "positive"
          })
          this.dlgEditar = false
        }).catch(error => {
          this.$q.notify({
            message: error,
            color: "negative"
          })
        }).finally(() => {
          let index = this.rows.findIndex(v => v.id == this.id)
          this.rows.splice(index, 1)
          this.loadingDelete = false
        })
      }).onCancel(() => {
        // console.log('>>>> Cancel')
      })
    },

  }, // methods

}
</script>
