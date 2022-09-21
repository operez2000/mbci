<template>
  <!-- <q-page class="flex column"> -->
    <div class="q-pa-md">
      <q-table
        class="q-ma-sm my-sticky-header-table"
        style="height: calc(100vh - 120px)"
        :rows="rows"
        :columns="columns"
        row-key="id"
        :selection="tblSelection"
        virtual-scroll
        v-model:selected="selected"
        :loading="loading.tabla"
        :filter="search"
        :pagination="initialPagination"
        dense
        bordered
      >
        <template v-slot:top>
          <!-- Cantidad de registros -->
          <span class="text-subtitle2">{{ `${txtPlural}: ${new Intl.NumberFormat().format(rows.length)}` }}</span>
          <q-space />
          <!-- Aseguradora -->
          <q-select
            v-model="aseguradora"
            color="info"
            style="width: 100px"
            :options="aseguradoras"
            option-value="id"
            option-label="nombre"
            label="Aseguradora"
            :loading="loading.aseguradoras"
            @update:model-value="getRecords()"
            dense
            options-dense
          />
          <q-space />
          <!-- Search -->
          <q-input dense debounce="300" v-model="search" placeholder="Buscar">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-space />
          <!-- Descargar póliza -->
          <q-btn
            class="q-mt-sm q-mr-sm"
            round
            color="negative"
            icon="mdi-file-pdf-box"
            size="sm"
            @click="pdfDownload(selected[0])"
            v-show="selected.length > 0"
            :disable="aseguradora.id != 1"
          >
            <q-tooltip anchor="top middle" self="bottom middle">Descargar Póliza en PDF</q-tooltip>
          </q-btn>
          <!-- Editar -->
          <q-btn
            class="q-mt-sm q-mr-sm"
            round
            color="indigo"
            icon="mdi-pencil"
            size="sm"
            @click="editData(selected[0])"
            v-if="selected.length > 0"
          >
            <q-tooltip anchor="top middle" self="bottom middle">Editar Email y Teléfono</q-tooltip>
          </q-btn>
          <!-- Borrar póliza -->
          <q-btn
            class="q-mt-sm q-mr-sm"
            round
            color="orange-9"
            icon="mdi-delete"
            size="sm"
            @click="borraPoliza(selected[0])"
            v-show="selected.length > 0"
          >
            <q-tooltip anchor="top middle" self="bottom middle">Borrar Póliza</q-tooltip>
          </q-btn>
          <!-- Enviar por Email -->
          <q-btn
            class="q-mt-sm q-mr-sm"
            round
            color="primary"
            icon="mdi-email"
            size="sm"
            @click="email = selected[0].email; dlgEnviarEmail = true"
            v-if="selected.length > 0"
          >
            <q-tooltip anchor="top middle" self="bottom middle">Enviar Póliza por Email</q-tooltip>
          </q-btn>
          <!-- Envío masivo por Email (texto libre) -->
          <q-btn
            class="q-mt-sm q-mr-sm"
            round
            color="info"
            icon="mdi-send"
            size="sm"
            @click="btnEnvioMultiple()"
          >
            <q-tooltip anchor="top middle" self="bottom middle">Envío masivo manual</q-tooltip>
          </q-btn>
          <!-- Enviar por SMS -->
          <q-btn
            class="q-mt-sm q-mr-sm"
            round
            color="warning"
            icon="mdi-message-text"
            size="sm"
            @click="telefono = selected[0].telefono; dlgEnviarSMS = true"
            v-if="selected.length > 0"
          >
            <q-tooltip anchor="top middle" self="bottom middle">Enviar SMS</q-tooltip>
          </q-btn>
          <!-- Generar CSV -->
          <q-btn
            class="q-mt-sm q-mr-sm"
            round
            color="light-green-8"
            icon="mdi-file-delimited"
            size="sm"
          >
            <q-tooltip anchor="top middle" self="bottom middle">Generar archivo CSV</q-tooltip>
            <q-menu>
              <q-list dense>
                <q-item clickable v-close-popup dense>
                  <q-item-section @click="generaCSV('NOMBRE_TELEFONO')">Nombre, Teléfono</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-close-popup dense>
                  <q-item-section @click="generaCSV('TELEFONO_NOMBRE')">Teléfono, Nombre</q-item-section>
                </q-item>
              </q-list>
          </q-menu>
          </q-btn>
          <!-- Actualizar tabla -->
          <q-btn
            class="q-mt-sm q-mr-sm"
            round
            color="dark"
            icon="mdi-refresh"
            size="sm"
            @click="getRecords()"
            :loading="loading.tabla"
          >
            <q-tooltip anchor="top middle" self="bottom middle">Actualizar Información</q-tooltip>
          </q-btn>
          <!-- Importar el reporte en XLS -->
          <q-btn
            class="q-mt-sm"
            round
            color="positive"
            icon="mdi-download"
            size="sm"
            @click="archivoExcel = null;dlgImportar = true"
          >
            <q-tooltip anchor="top middle" self="bottom middle">Importar Archivo de Excel</q-tooltip>
          </q-btn>
        </template>
      </q-table>
    </div>

    <!-- Diálogo para importar el reporte en Excel -->
    <q-dialog v-model="dlgImportar">
      <q-card>
        <q-card-section>
          <div class="text-h6">Parámetros de Importación</div>
        </q-card-section>
        <q-card-section>
          <div class="row">
            <div class="col-12">
              <q-select
                v-model="aseguradora"
                color="info"
                :options="aseguradoras"
                option-value="id"
                option-label="nombre"
                label="Aseguradora"
                :loading="loading.aseguradoras"
              />
            </div>
          </div>
          <br>
          <div class="row">
            <div class="col-12">
              <q-file
                v-model="archivoExcel"
                label="Cargar archivo de Excel"
                filled
                style="max-width: 300px"
                @update:model-value="changeFile($event)"
                accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="attachment" />
                </template>
              </q-file>
              <!-- <q-uploader
                v-model="archivoExcel"
                url="#"
                style="max-width: 300px"
                label="Cargar archivo de Excel"
                @change="changeFile($event)"
                @added="added"
              /> -->
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-circular-progress
            show-value
            font-size="12px"
            :value="progress"
            size="50px"
            :thickness="0.13"
            color="blue"
            track-color="grey-6"
            class="q-ma-md"
            v-show="loading.import"
          >
            {{ progress }}%
          </q-circular-progress>
          <q-btn flat label="Ok" color="primary" v-close-popup no-caps :loading="loading.import" />
        </q-card-actions>
      </q-card>
    </q-dialog>     <!-- Importar reporte en Excel  -->

    <!-- Diálogo para enviar por email -->
    <q-dialog v-model="dlgEnviarEmail">
      <q-card style="width: 480px">
        <q-card-section>
          <div class="text-h6">Envío de Póliza por Email</div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="row">
            <div class="col-12 q-gutter-lg">
              <q-radio v-model="tipoEnvio" val="vencimiento" label="Vencimiento" />
              <q-radio v-model="tipoEnvio" val="agradecimiento" label="Agradecimiento" />
              <q-radio v-model="tipoEnvio" val="libre" label="Libre" />
            </div>
          </div>
          <div v-show="tipoEnvio == 'libre'" >
            <div class="row">
              <div class="col-6 q-pr-sm">
                <q-input v-model="selected[0].referencia" label="Póliza" dense readonly />
              </div>
              <div class="col-6">
                <q-input v-model="selected[0].telefono" label="Teléfono" dense readonly />
              </div>
            </div>
            <div class="row">
              <div class="col-12">
                <q-input v-model="selected[0].asegurado" label="Asegurado" dense readonly />
              </div>
            </div>
            <div class="row">
              <div class="col-4">
                <q-input v-model="selected[0].marca" label="Marca" dense readonly />
              </div>
              <div class="col-4 q-px-sm">
                <q-input v-model="selected[0].descripcion" label="Descripción" dense readonly />
              </div>
              <div class="col-4">
                <q-input v-model="selected[0].modelo" label="Modelo" dense readonly />
              </div>
            </div>
            <div class="row">
              <div class="col-5">
                <q-input v-model="selected[0].fExpiracion" label="F. Expiración" dense readonly />
              </div>
            </div>
            <div class="row q-mt-md">
              <div class="col-12">
                <q-input v-model="txtLibre" label="Cuerpo del Email" dense filled autogrow />
              </div>
            </div>
          </div>
          <br><q-separator />
          <div class="row">
            <div class="col-12">
              <q-input type="email" v-model="email" label="Email" @keypress.enter="enviarEmail()" >
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            color="primary"
            icon="close"
            v-close-popup
            :disabled="loading.enviarEmail"
          />
          <q-btn
            flat
            color="primary"
            icon="send"
            :loading="loading.enviarEmail"
            @click="enviarEmail()"
            :disabled="!email"
          />
        </q-card-actions>
      </q-card>
    </q-dialog> <!-- Diálogo para enviar por email -->

    <!-- Diálogo para enviar por SNS -->
    <q-dialog v-model="dlgEnviarSMS">
      <q-card style="width: 480px">
        <q-card-section>
          <div class="text-h6">Envío de SMS</div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="row">
            <div class="col-12 q-gutter-lg">
              <q-radio v-model="pais" val="us" label="US +1" />
              <q-radio v-model="pais" val="mx" label="México +52" />
            </div>
          </div>
          <div class="row">
            <div class="col-12 q-gutter-lg">
              <q-radio v-model="tipoEnvio" val="vencimiento" label="Vencimiento" />
              <q-radio v-model="tipoEnvio" val="agradecimiento" label="Agradecimiento" />
            </div>
          </div>
          <div class="row">
            <div class="col-12">
              <q-input type="text" v-model="telefono" label="Teléfono" @keypress.enter="enviarSMS()" >
                <template v-slot:prepend>
                  <q-icon name="mdi-phone" />
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            color="primary"
            icon="close"
            v-close-popup
            :disabled="loading.enviarSMS"
          />
          <q-btn
            flat
            color="primary"
            icon="send"
            :loading="loading.enviarSMS"
            @click="enviarSMS()"
            :disabled="!telefono"
          />
        </q-card-actions>
      </q-card>
    </q-dialog> <!-- Diálogo para enviar por SMS -->

    <!-- Diálogo para envío manual masivo de correos y SMS -->
    <q-dialog
      v-model="dlgEnvioMasivo"
      full-width
      full-height
    >
      <q-card>
        <q-card-section>
          <div class="row">
            <div class="col-1">
              <q-btn
                class="q-mr-md"
                round
                icon="close"
                v-close-popup
                dark
              >
                <q-tooltip>Regresar</q-tooltip>
              </q-btn>
            </div>
            <div class="col"></div>
            <div class="col">
              <span class="text-h6">Envío masivo Email/SMS</span>
            </div>
            <div class="col"></div>
            <div class="col-1">
              <q-btn
                class="q-mr-md"
                color="info"
                round
                icon="mdi-send"
                dark
                @click="envioMasivo()"
                :loading="loading.masivo"
                :disabled="masivo.selected.length == 0 || !masivo.cuerpo"
              >
                <q-tooltip>Realizar envío</q-tooltip>
              </q-btn>
            </div>
          </div>

        </q-card-section>

        <q-card-section class="q-pa-sm q-gutter-sm">
          <!-- Tipo de envio (Email / SMS) -->
          <div class="row">
            <div class="col-6">
              <q-radio v-model="masivo.tipo" val="email" label="Email" />
              <q-radio v-model="masivo.tipo" val="sms" label="SMS" />
            </div>
            <div class="col-6">
              <!-- Aseguradoras -->
              <q-select
                v-model="filtroMasivo"
                color="info"
                style="width: 160px"
                :options="filtrosMasivos"
                option-value="id"
                option-label="nombre"
                label="Filtrar por:"
                :loading="loading.filtroMasivo"
                @update:model-value="btnEnvioMultiple()"
                dense
                options-dense
              />
            </div>
          </div>
          <!-- Asunto -->
          <div class="row" v-show="masivo.tipo == 'email'">
            <div class="col-12">
              <q-input v-model="masivo.asunto" label="Asunto" dense filled />
            </div>
          </div>
          <!-- Texto -->
          <div class="row">
            <div class="col-12">
              <q-input v-model="masivo.cuerpo" label="Texto (cuerpo)" dense filled autogrow />
            </div>
          </div>
          <q-separator />
          <div class="row">
            <!-- Nombre -->
            <div class="col-6 q-pr-md">
              <q-input v-model="masivo.nombre" label="Nombre" dense filled />
            </div>
            <!-- Email -->
            <div class="col-6">
              <q-input type="email" v-model="masivo.email" label="Email" dense filled />
            </div>
          </div>
          <div class="row">
            <!-- Teléfono -->
            <div class="col-3">
              <q-input v-model="masivo.telefono" label="Teléfono" dense filled mask="(###) ###-####" />
            </div>
            <!-- Prefijo -->
            <div class="col-3">
              <q-radio v-model="masivo.pais" val="us" label="US +1" />
              <q-radio v-model="masivo.pais" val="mx" label="MX +52" />
            </div>
            <div class="col"></div>
            <div class="col-1">
              <q-btn
                class="q-ml-lg"
                color="positive"
                round
                text-color="white"
                icon="add"
                size="sm"
                @click="addClient()"
                :loading="loading.addClient"
                :disabled="!masivo.nombre || !masivo.email || !masivo.telefono"
              >
                <q-tooltip anchor="top left" self="top left">Agregar a la lista</q-tooltip>
              </q-btn>
            </div>
          </div>
          <!-- Tabla de clientes para envio masivo -->
          <q-table
            class="q-ma-sm"
            style="height: calc(100vh - 440px)"
            :rows="masivo.rows"
            :columns="masivo.columns"
            row-key="id"
            selection="multiple"
            virtual-scroll
            v-model:selected="masivo.selected"
            :loading="loading.tabla"
            :filter="masivo.search"
            :pagination="initialPagination"
            dense
            bordered
          >
            <template v-slot:top>
              <!-- Cantidad de registros -->
              <span class="text-subtitle2">{{ `Registros: ${new Intl.NumberFormat().format(masivo.rows.length)}` }}</span>
              <q-space />
              <!-- Search -->
              <q-input dense debounce="300" v-model="masivo.search" placeholder="Buscar" clearable>
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
              <q-space />
              <q-btn
                flat
                round
                size="md"
                color="negative"
                dense
                @click="removeClients()"
                icon="mdi-delete"
                :disabled="masivo.selected.length == 0"
              />
            </template>

            <!-- <template v-slot:header="props">
              <q-tr :props="props">
                <q-th auto-width />
                <q-th
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props"
                >
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td auto-width>
                  <q-btn flat round size="sm" color="negative" dense @click="removeClient(props.row)" icon="mdi-delete" />
                </q-td>
                <q-td
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props"
                >
                  {{ col.value }}
                </q-td>
              </q-tr>
            </template> -->

          </q-table>
        </q-card-section>

        <q-card-actions align="right" class="">
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- final diálogo para envío manual masivo de correos y SMS  -->

    <!-- Edición de Teléfono e Email para la tabla -->
    <q-dialog v-model="qEdit.show">
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ qEdit.asegurado }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <div class="row">
            <div class="col-6">
              <q-input square outlined v-model="qEdit.telefono" label="Teléfono..." autofocus dense />
            </div>
            <div class="col-6">
              <q-input square outlined v-model="qEdit.email" label="Email" dense />
            </div>
          </div>
          <div class="row">
            <div class="col-2">
              <q-input square outlined v-model="qEdit.tipo" label="Tipo Auto" dense />
            </div>
            <div class="col-2">
              <q-input square outlined v-model="qEdit.modelo" label="Modelo" dense />
            </div>
            <div class="col-2">
              <q-input square outlined v-model="qEdit.marca" label="Marca" dense />
            </div>
            <div class="col-6">
              <q-input square outlined v-model="qEdit.descripcion" label="Descripción" dense />
            </div>
          </div>
          <div class="row">
            <div class="col-12">
              <q-input square outlined v-model="qEdit.observaciones" label="Observaciones" dense />
            </div>
          </div>

        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Ok" color="primary" v-close-popup no-caps :loading="qEdit.loading" @click="grabaVarios()" />
        </q-card-actions>
      </q-card>
    </q-dialog>


  <!-- </q-page> -->
</template>

<script>
const XLSX = require('xlsx') // import XLSX from 'xlsx'
import moment from 'moment'
import Utils from '../assets/utils/index'
const utils = new Utils()
//import { api } from 'boot/axios'

export default {
  //name: 'Usuarios',
  data() {
    return {
      txtSingular: 'Póliza',
      txtPlural: 'Pólizas',
      aseguradora: {
        id: 1,
        nombre: 'Chubb',
        initData: 2
      },
      aseguradoras: [],
      filtrosMasivos: [],
      filtroMasivo: null,
      localData: {},
      dlgImportar: false,
      dlgEnviarEmail: false,
      dlgEnviarSMS: false,
      archivoExcel: null,
      selected: [],
      singleSelect: false,
      search: '',
      columns: [
        { name: 'referencia', field: "referencia", label: "Póliza", sortable: true, align: "left" },
        { name: "fEfectiva", field: "fEfectiva", label: 'Ini Vigencia A-M-D', sortable: true, align: "left" },
        { name: "fExpiracion", field: "fExpiracion", label: 'F Expiración A-M-D', sortable: true, align: "left" },
        { name: "diasExpiracion", field: "diasExpiracion", label: 'Días Exp', sortable: true, align: "right" },
        { name: "descProducto", field: "descProducto", label: 'Producto', sortable: true, align: "left" },
        { name: "fecha", field: "fecha", label: 'F Venta A-M-D', sortable: true, align: "left" },
        { name: "asegurado", field: "asegurado", label: 'Asegurado', sortable: true, align: "left" },
        { name: "telefono", field: "telefono", label: 'Teléfono', sortable: true, align: "left" },
        { name: "email", field: "email", label: 'Email', sortable: true, align: "left" },
        { name: "vendedor", field: "vendedor", label: 'Vendedor', sortable: true, align: "left" },
        { name: "fCancelacion", field: "fCancelacion", label: 'F Cancelación A-M-D', sortable: true, align: "left" },
        { name: "tipo", field: "tipo", label: 'Tipo', sortable: true, align: "left" },
        { name: "modelo", field: "modelo", label: 'Modelo', sortable: true, align: "left" },
        { name: "marca", field: "marca", label: 'Marca', sortable: true, align: "left" },
        { name: "descripcion", field: "descripcion", label: 'Descripción', sortable: true, align: "left" },
        { name: "ultimoEmail", field: "ultimoEmail", label: 'Ultimo Email', sortable: true, align: "left" },
        { name: "ultimoSMS", field: "ultimoSMS", label: 'Ultimo SMS', sortable: true, align: "left" },
        { name: "ultimoWhatsApp", field: "ultimoWhatsApp", label: 'Ultimo WhatsApp', sortable: true, align: "left" },
        { name: 'observaciones', field: "observaciones", label: "Observaciones", sortable: false, align: "left", required: false },
        { name: 'id', field: "id", label: "Id", sortable: true, align: "right" },
      ],
      visibleColumns: [],
      rows: [],
      selected: [],
      initialPagination: {
        sortBy: 'poliza',
        descending: false,
        page: 1,
        rowsPerPage: 0 // 20
        // rowsNumber: xx if getting data from a server
      },
      loading: {
        aseguradoras: false,
        tabla: false,
        import: false,
        enviarEmail: false,
        enviarSMS: false,
        masivo: false,
        addClient: false,
        filtroMasivo: false,
        csv: false,
      },
      progress: 0,
      email: '',
      telefono: "",
      pais: "us",
      tipoEnvio: "vencimiento",
      txtLibre: "",
      tblSelection: 'single',
      dlgEnvioMasivo: false,
      masivo: {
        tipo: "email",  // "sms"
        asunto: "",
        cuerpo: "",
        nombre: "",
        email: "",
        telefono: "",
        pais: "us",
        search: "",
        loading: false,
        selected: [],
        columns: [
          { name: 'id', field: "id", label: "No.", sortable: true, align: "center" },
          { name: 'nombre', field: "nombre", label: "Nombre", sortable: true, align: "left" },
          { name: 'email', field: "email", label: "Email", sortable: true, align: "left" },
          { name: 'telefono', field: "telefono", label: "Teéfono", sortable: true, align: "left" },
          { name: 'pais', field: "pais", label: "País", sortable: true, align: "left" },
          { name: 'enviado', field: "enviado", label: "Enviado", sortable: true, align: "left" },
          { name: 'respuesta', field: "respuesta", label: "Respuesta", sortable: true, align: "left" },
        ],
        rows: [],
      },
      qEdit: {
        show: false,
        loading: false,
        id: -1,
        asegurado: "",
        telefono: "",
        email: "",
        tipo: "",
        modelo: "",
        marca: "",
        descripcion: "",
        observaciones: "",
      },

    } // return data()
  }, // data()

  mounted() {
    const cols = this.columns.map(({name}) => name)
    this.visibleColumns = cols.unshift()

    this.getAseguradoras()
    this.getRecords()
  },

  computed: {
  },

  methods: {

    changeFile(e) {
      let f = this.archivoExcel
      if (f == undefined) {
        return
      }
      this.loading.tabla = true
      this.loading.import = true
      let reader = new FileReader()
      let fCancelacion
      let jsonCfg = {}

      reader.onload = (e) => {
        try {
          const bstr = e.target.result
          const wb = XLSX.read(bstr, {type:'binary', cellDates: true, cellNF: false, cellText: false})
          const wsname = wb.SheetNames[0]
          const ws = wb.Sheets[wsname]
          const cols = this.make_cols(ws['!ref'])

          let rows = XLSX.utils.sheet_to_json(ws, {header: "A"})
//          rows.shift( ((idAseguradora == 1) ? 0 : 1) )  // Quito el primer renglón (encabezado)
/*
          let tmp =  XLSX.utils.sheet_to_json(ws, {header: 1})
          let enc = tmp[0]
          //this.columns = []
          for (let index = 0; index < enc.length; index++) {
            //this.tblEdoCtaBanco.headers.push( {text: enc[index], value: cols[index].name} )
          }
*/



/*
for (let [key, value] of rows.entries()) {
  console.log("key", key, "value", value.AB)
  let fNac = moment(value.AB).format("DD-MM-YYYY")
  console.log("fNac", fNac)
}
return

*/
          for (let index = 0; index < rows.length; index++) {
            const element = rows[index];
            if ( (index+1) >= this.aseguradora.initData ) { // a partir del renglón que corresponde a la hoja de excel
              if (element.C && element.C != '') {  // No. de Poliza
                let fTemp = moment(element.AC).format("DD/MM/YYYY") || ''  // Fecha de Nacimiento
                if (fTemp == "Invalid date") {
                  element.AC = ""
                } else {
                  element.AC = fTemp.substr(6, 4) + "-" + fTemp.substr(3, 2) + "-" + fTemp.substr(0, 2)
                }

                // Fecha de Cancelacion
                if (this.aseguradora.id == 1) {
                  fCancelacion = element.U
                } else if (this.aseguradora.id == 2) {
                  fCancelacion = element.T
                }
                if (typeof fCancelacion == 'string') {
                  if (fCancelacion.toUpperCase() == "N/A") {
                    if (this.aseguradora.id == 1) {
                      element.U = ""
                    } else if (this.aseguradora.id == 2) {
                      element.T = ""
                    }
                  }
                } else {
                  fTemp = moment(element.U).format("MM/DD/YYYY") || ''
                  fCancelacion = fTemp.substr(6, 4) + '-' + fTemp.substr(0, 2) + '-' + fTemp.substr(3, 2)
                }
                if (this.aseguradora.id == 1) {  // Chubb
                  element.U = fCancelacion
                  jsonCfg.producto = element.D || ''
                  jsonCfg.descProducto = element.E || ''
                  jsonCfg.tipo = element.F || ''
                  jsonCfg.fecha = new Date(element.G).toLocaleDateString('en-CA') || ''
                  jsonCfg.asegurado = element.H || ''
                  jsonCfg.fEfectiva = new Date(element.I).toLocaleDateString('en-CA') || ''
                  jsonCfg.fExpiracion = new Date(element.J).toLocaleDateString('en-CA') || ''
                  jsonCfg.agente = element.K || ''
                  jsonCfg.vendedor = element.L || ''
                  jsonCfg.neto = element.M || 0
                  jsonCfg.tarifa = element.N || 0
                  jsonCfg.totalPoliza = element.O || 0
                  jsonCfg.tarifaAgente = element.P || 0
                  jsonCfg.tarifaProceso = element.Q || 0
                  jsonCfg.refUID = element.R || ''
                  jsonCfg.metodoPago = element.S || ''
                  jsonCfg.estatus = element.T || ''
                  jsonCfg.fCancelacion = element.U || ''
                  jsonCfg.tipoVehiculo = element.V || ''
                  jsonCfg.valorDeclarado = element.W || 0
                  jsonCfg.modelo = element.X || 0
                  jsonCfg.marca = element.Y || ''
                  jsonCfg.descripcion = element.Z || ''
                  jsonCfg.vin = element.AA || ''
                  jsonCfg.placas = element.AB || ''
                  jsonCfg.fNacimiento = element.AC || ''
                  jsonCfg.territorio = element.AD || ''
                  jsonCfg.domicilio = element.AE || ''
                  jsonCfg.ciudad = element.AF || ''
                  jsonCfg.estado = element.AG || ''
                  jsonCfg.cp = element.AH || ''
                  jsonCfg.telefono = element.AI || ''
                  jsonCfg.email = element.AJ || ''
                } else if (this.aseguradora.id == 2) { // GNP
                  element.T = fCancelacion
                  jsonCfg.producto = ''
                  jsonCfg.descProducto = element.D || ''
                  jsonCfg.tipo = element.E || ''
                  /*
                  fTemp = moment(element.F).format("MM/DD/YYYY") || ''  // Fecha de Nacimiento MM/DD/YYYY
                  if (fTemp == "Invalid date") {
                    jsonCfg.fecha = ""
                  } else {
                    jsonCfg.fecha = fTemp.substr(6, 4) + "-" + fTemp.substr(3, 2) + "-" + fTemp.substr(0, 2)
                  }
                  */
                  jsonCfg.fecha = new Date(element.F).toLocaleDateString('en-CA') || ''
                  jsonCfg.asegurado = element.G || ''
                  /*
                  fTemp = moment(element.H).format("MM/DD/YYYY") || ''  // Fecha de Nacimiento MM/DD/YYYY
                  if (fTemp == "Invalid date") {
                    jsonCfg.fEfectiva = ""
                  } else {
                    jsonCfg.fEfectiva = fTemp.substr(6, 4) + "-" + fTemp.substr(3, 2) + "-" + fTemp.substr(0, 2)
                  }
                  */
                  jsonCfg.fEfectiva = new Date(element.H).toLocaleDateString('en-CA') || ''
                  /*
                  fTemp = moment(element.I).format("MM/DD/YYYY") || ''  // Fecha de Nacimiento MM/DD/YYYY
                  if (fTemp == "Invalid date") {
                    jsonCfg.fExpiracion = ""
                  } else {
                    jsonCfg.fExpiracion = fTemp.substr(6, 4) + "-" + fTemp.substr(3, 2) + "-" + fTemp.substr(0, 2)
                  }
                  */
                  jsonCfg.fExpiracion =  new Date(element.I).toLocaleDateString('en-CA') || ''
                  jsonCfg.agente = element.J || ''
                  jsonCfg.vendedor = element.K || ''
                  jsonCfg.neto = element.M || 0
                  jsonCfg.tarifa = element.N || 0
                  jsonCfg.totalPoliza = element.M || 0
                  jsonCfg.tarifaAgente = element.O || 0
                  jsonCfg.tarifaProceso = element.P || 0
                  jsonCfg.refUID = element.Q || ''
                  jsonCfg.metodoPago = element.R || ''
                  jsonCfg.estatus = element.S || ''
                  fTemp = moment(element.T).format("MM/DD/YYYY") || ''  // Fecha de Nacimiento MM/DD/YYYY
                  if (element.T == "N/A") {
                    jsonCfg.fCancelacion = ""
                  } else if (fTemp == "Invalid date") {
                    jsonCfg.fCancelacion = ""
                  } else {
                    jsonCfg.fCancelacion = fTemp.substr(6, 4) + "-" + fTemp.substr(3, 2) + "-" + fTemp.substr(0, 2)
                  }
                  jsonCfg.tipoVehiculo = ''
                  jsonCfg.valorDeclarado = 0
                  jsonCfg.modelo = 0
                  jsonCfg.marca = ''
                  jsonCfg.descripcion = ''
                  jsonCfg.vin = ''
                  jsonCfg.placas = ''
                  jsonCfg.fNacimiento = ''
                  jsonCfg.territorio = ''
                  jsonCfg.domicilio = ''
                  jsonCfg.ciudad = ''
                  jsonCfg.estado = ''
                  jsonCfg.cp = ''
                  jsonCfg.telefono = ''
                  jsonCfg.email = ''
                }

console.log("poliza", element.B, element.AC, typeof element.AC)

                this.grabaRegistro(index, rows.length, {
                  idAseguradora: this.aseguradora.id,
                  poliza: element.B || '',
                  referencia: element.C || '',
                  producto: jsonCfg.producto || '',
                  descProducto: jsonCfg.descProducto || '',
                  tipo: jsonCfg.tipo || '',
                  fecha: jsonCfg.fecha,  //  fecha: (element.G.substr(6, 4) + '-' + element.G.substr(0, 2) + '-' + element.G.substr(3, 2)) || '',
                  asegurado: jsonCfg.asegurado || '',
                  fEfectiva: jsonCfg.fEfectiva, // (element.I.substr(6, 4) + '-' + element.I.substr(0, 2) + '-' + element.I.substr(3, 2)) || null,
                  fExpiracion: jsonCfg.fExpiracion, // (element.J.substr(6, 4) + '-' + element.J.substr(0, 2) + '-' + element.J.substr(3, 2)) || null,
                  agente: jsonCfg.agente || '',
                  vendedor: jsonCfg.vendedor || '',
                  neto: jsonCfg.neto,
                  tarifa: jsonCfg.tarifa || 0,
                  totalPoliza: jsonCfg.totalPoliza || 0,
                  tarifaAgente: jsonCfg.tarifaAgente || 0,
                  tarifaProceso: jsonCfg.tarifaProceso || 0,
                  refUID: jsonCfg.refUID || '',
                  metodoPago: jsonCfg.metodoPago || '',
                  estatus: jsonCfg.estatus || '',
                  fCancelacion: jsonCfg.fCancelacion || '', // new Date(element.U).toLocaleDateString('en-CA') || ''
                  tipoVehiculo: jsonCfg.tipoVehiculo,
                  valorDeclarado: jsonCfg.valorDeclarado,
                  modelo: jsonCfg.modelo || '',
                  marca: jsonCfg.marca || '',
                  descripcion: jsonCfg.descripcion || '',
                  vin: jsonCfg.vin || '',
                  placas: jsonCfg.placas,
                  fNacimiento: jsonCfg.fNacimiento, //element.AC.toLocaleDateString('fr-CA') || '', // new Date(element.AC).toLocaleDateString('en-CA') || '', // (element.AC.substr(6, 4) + '-' + element.AC.substr(3, 2) + '-' + element.AC.substr(0, 2)) || null,
                  territorio: jsonCfg.territorio || '',
                  domicilio: jsonCfg.domicilio || '',
                  ciudad: jsonCfg.ciudad || '',
                  estado: jsonCfg.estado || '',
                  cp: jsonCfg.cp || '',
                  telefono: jsonCfg.telefono || '',
                  email: jsonCfg.email || ''

                }) // this.grabaRegistro()

              } // col C debe tener datos
            } // index + 1 >= this.aseguradora.initData
          } // for

        } catch (err) {
          console.log('error', err)
          this.$q.notify({
            message: 'Se detectó un inconveniente con el archivo, es posible que no tenga información ' + err
          })

        } finally {
          this.loading.tabla = false
          this.loading.import = false
          this.dlgImportar = false
          this.getPolizas()

        }
      } // reader.onload()
      reader.readAsBinaryString(f)

    }, // changeFile()

    make_cols(refstr) {
       return Array(XLSX.utils.decode_range(refstr).e.c + 1).fill(0).map((x,i) => ({name:XLSX.utils.encode_col(i), key:i}))
    }, // make_cols()

    added(item) {
      this.archivoExcel = item
      let reader = new FileReader()
      reader.onload = (e) => {
        try {
          this.loading.import = true
          this.rows = []
          const bstr = e.target.result
          const wb = XLSX.read(bstr, {type:'binary', cellDates: true, cellNF: false, cellText: false})
          const wsname = wb.SheetNames[0]
          const ws = wb.Sheets[wsname]
          const cols = this.make_cols(ws['!ref'])

  /*
          this.rows = XLSX.utils.sheet_to_json(ws, {header: "A"})
          this.rows.shift(0)  // Quito el primer renglón (encabezado)
          let tmp =  XLSX.utils.sheet_to_json(ws, {header: 1})
          let enc = tmp[0]
          this.tblEdoCtaBanco.headers = []
          for (let index = 0; index < enc.length; index++) {
            this.tblEdoCtaBanco.headers.push( {text: enc[index], value: cols[index].name} )
          }
          this.loadingEdoCta = false
          this.loadingBanco = false

          this.$vuetify.goTo('#idtblEdoCtaBanco', {
            duration: 300,
            offset: 0,
            easing: 'easeInOutCubic',
          })
  */

        } catch (err) {
          console.log('error', err)
          this.$q.notify({
            message: 'Se detectó un inconveniente con el archivo, es posible que no tenga información',
            caption: err
          })
        } finally {
          this.loading.import = false
        }
      } // reader.onload()

    }, // added()

    getAseguradoras() {
      this.loading.aseguradoras = true
      this.aseguradoras = []
      this.$axios(`/api/aseguradoras`).then(resp => {
console.log("resp", resp.data)
        if (resp.data.result == 404) {
          this.$q.notify({
            color: "warning",
            message: 'Se detectó un inconveniente con la Base de Datos'
          })
        } else if (resp.data.result == 200) {
          this.aseguradoras = resp.data.results
          if (this.aseguradoras.length > 0) {
            this.aseguradora = this.aseguradoras[0]
          }
          // Todas las aseguradoras (para filtro en envio masivo)
          this.filtrosMasivos.push({
            id: 0,
            initData: 0,
            nombre: "- Todas -",
            contacto1: "",
            contacto2: "",
            email1: "",
            email2: "",
            web: ""
          })
          // Agrego las aseguradoras (filtro envío masivo)
          this.aseguradoras.forEach(element => {
            this.filtrosMasivos.push({
              id: element.id,
              initData: element.initData,
              nombre: element.nombre,
              contacto1: element.contacto1,
              contacto2: element.contacto2,
              email1: element.email1,
              email2: element.email2,
              web: element.web
            })
          })
          // Clientes externos (filtro envío masivo)
          this.filtrosMasivos.push({
            id: 999999999,
            initData: 0,
            nombre: "Clientes Externos",
            contacto1: "",
            contacto2: "",
            email1: "",
            email2: "",
            web: ""
          })
          this.filtroMasivo = this.filtrosMasivos[0]

        }
      }).catch(err => {
        console.log('Error al leer los registros', err)
        this.$q.notify({
          color: "warning",
          message: 'Se detectó un inconveniente con la Base de Datos ' + err
        })
      }).finally(() => {
        this.loading.aseguradoras = false
//          this.$q.loading.hide()
      }) // axios

    }, // getAseguradoras()

    async getPolizas() {
      let rows = this.rows
      let data
      try {
        this.loading.tabla = true
        this.$q.loading.show({
          message: 'Leyendo, un momento por favor...'
        })
        data = await this.$axios({
          url: `/api/polizas`,
          method: 'get',
          params: {
            idAseguradora: this.aseguradora.id
          }
        })
        this.rows = await data.data.results
        let agregadas = await this.rows.length - rows.length
        this.$q.notify({
          message: `Pólizas agregadas: ${agregadas}`
        })
      } catch (error) {
        console.log("Error", error)
      } finally {
        this.loading.tabla = false
        this.$q.loading.hide()
      }
    }, // async getPolizas()

    getRecords() {
//      this.$q.loading.show()
      this.rows = []
      this.loading.tabla = true
      this.$q.loading.show({
        message: 'Leyendo, un momento por favor...'
      })
      this.$axios({
        url: `/api/polizas`,
        method: 'get',
        params: {
          idAseguradora: this.aseguradora.id
        }
      }).then(resp => {
        if (resp.data.result == 200) {
          this.rows = resp.data.results
        } else {
          this.$q.notify({
            color: "warning",
            message: resp.data.msg
          })
        }
      }).catch(err => {
        console.log('Error al leer los registros', err)
        this.$q.notify({
          color: "warning",
          message: 'Se detectó un inconveniente con la Base de Datos ' + err
        })
      }).finally(() => {
        this.loading.tabla = false
        this.$q.loading.hide()
      }) // axios

    }, // getRecords()

    pdfDownload(item) {
      window.open(`https://chubbcrossborder.com/chubb/cosas5.php?poliza=${item.poliza}&companiaId=1&coverageId=2`)
    },

    editData(item) {
      this.qEdit.id = item.id
      this.qEdit.asegurado = item.asegurado
      this.qEdit.telefono = item.telefono
      this.qEdit.email = item.email
      this.qEdit.tipo = item.tipo
      this.qEdit.modelo = item.modelo
      this.qEdit.marca = item.marca
      this.qEdit.descripcion = item.descripcion
      this.qEdit.observaciones = item.observaciones
      this.qEdit.show = true
    }, // editData()

    grabaVarios() {
      let index = this.rows.findIndex(v => v.id == this.qEdit.id)
      this.qEdit.loading = true
      this.$axios({
        method: "put",
        url: `/api/edita-varios/${this.qEdit.id}`,
        data: {
          telefono: this.qEdit.telefono,
          email: this.qEdit.email,
          tipo: this.qEdit.tipo,
          modelo: this.qEdit.modelo,
          marca: this.qEdit.marca,
          descripcion: this.qEdit.descripcion,
          observaciones: this.qEdit.observaciones
        }
      }).then(resp => {
        if (resp.data.result == 200) {
          if (index >= 0) {
            this.rows[index].email = this.qEdit.email
            this.rows[index].telefono = this.qEdit.telefono
            this.rows[index].tipo = this.qEdit.tipo
            this.rows[index].modelo = this.qEdit.modelo
            this.rows[index].marca = this.qEdit.marca
            this.rows[index].descripcion = this.qEdit.descripcion
            this.rows[index].observaciones = this.qEdit.observaciones
          }
        } else {
          this.$q.notify({
            message: "Se detectó un inconveniente",
            caption: resp.data.msg
          })
        }
      }).catch(err => {
        console.log("err", err)
      }).finally(() => {
        this.qEdit.loading = false
        this.qEdit.show = false
      })
    },

    enviarEmail() {
      if (this.email && this.email != "") {
        this.loading.enviarEmail = true
        this.$axios({
          method: "post",
          url: "/api/enviarEmail",
          data: {
            idAseguradora: this.aseguradora.id,
            tipoEnvio: this.tipoEnvio,
            id: this.selected[0].id,
            poliza: this.selected[0].poliza,
            referencia: this.selected[0].referencia,
            asegurado: this.selected[0].asegurado,
            email: this.email,
            subject: "",
            body: "",
            liga: `https://chubbcrossborder.com/chubb/cosas5.php?poliza=${this.selected[0].poliza}&companiaId=1&coverageId=2`,
            marca: this.selected[0].marca,
            descripcion: this.selected[0].descripcion,
            modelo: this.selected[0].modelo,
            fExpiracion: this.selected[0].fExpiracion,
            txtLibre: this.txtLibre,
          }
        }).then(resp => {
          console.log("resp", resp.data)
          if (resp.data.result == 200) {
            this.$q.notify({
              message: resp.data.msg,
              color: "green-10"
            })
          } else {
            this.$q.notify({
              message: resp.data.msg,
              color: "deep-orange"
            })
          }
        }).catch(error => {
          console.log("error", error)
          this.$q.notify({
            message: `<pre>${error}</pre>`,
            color: "deep-orange",
            html: true
          })
        }).finally(() => {
          this.loading.enviarEmail = false
        })
      } // if (this.email)
    }, // enviarEmail()

    btnEnvioMultiple() {
      this.loading.tabla = true
      this.loading.filtroMasivo = true
      this.masivo.search = ""
      this.dlgEnvioMasivo = true
      this.masivo.rows = []
      this.$axios(`/api/polizas-clientes/${this.filtroMasivo.id}`).then(resp => {
        if (resp.data.result !== 200) {
          this.$q.notify({
            color: "warning",
            message: 'Se detectó un inconveniente con la Base de Datos',
            caption: resp.data.msg
          })
        } else {
          this.masivo.rows = resp.data.results
        }
      }).catch(err => {
        console.log('Error al leer los registros', err)
        this.$q.notify({
          color: "warning",
          message: 'Se detectó un inconveniente con la Base de Datos ',
          caption: err
        })
      }).finally(() => {
        this.loading.tabla = false
        this.loading.filtroMasivo = false
      }) // axios
    }, // btnEnvioMultiple()

    enviarSMS() {
      if (this.selected[0].telefono && this.selected[0].telefono != "") {
        this.loading.enviarSMS = true
        this.$axios({
          method: "post",
          url: "/api/enviarSMS",
          data: {
            tipoEnvio: this.tipoEnvio,
            medio: "",
            id: this.selected[0].id,
            poliza: this.selected[0].poliza,
            referencia: this.selected[0].referencia,
            asegurado: this.selected[0].asegurado,
            telefono: this.telefono,
            subject: "",
            body: "",
            liga: `https://chubbcrossborder.com/chubb/cosas5.php?poliza=${this.selected[0].poliza}&companiaId=1&coverageId=2`,
            marca: this.selected[0].marca,
            descripcion: this.selected[0].descripcion,
            modelo: this.selected[0].modelo,
            fExpiracion: this.selected[0].fExpiracion,
            pais: this.pais
          }
        }).then(resp => {
          console.log("resp", resp.data)
          if (resp.data.result == 200) {
            this.$q.notify({
              message: "Mensaje enviado correctamente",
              color: "green-10"
            })
          } else {
            this.$q.notify({
              message: "No se ha podido enviar el mensaje",
              color: "deep-orange"
            })
          }
        }).catch(error => {
          console.log("error", error)
          this.$q.notify({
            message: `<pre>${error}</pre>`,
            color: "deep-orange",
            html: true
          })
        }).finally(() => {
          this.loading.enviarSMS = false
        })
      } else { // if (this.telefono)
        this.$q.notify({
          message: "Teléfono incorrecto"
        })
      }
    }, // enviarSMS()

    async grabaRegistro(index, rows, item) {
      this.progress = ((index / rows.length) * 100).toFixed(0)
      try {
        await this.$axios({
          method: "post",
          url: "/api/poliza",
          data: item
        })
      } catch (error) {
        console.log('Error al grabar los registros', error)
        this.$q.notify({
          color: "warning",
          message: 'Se detectó un inconveniente:',
          caption: error
        })
      }

    },

    addClient() {
      let index = this.masivo.rows.findIndex(v => v.email == this.masivo.email)

      this.loading.addClient = true
      this.$axios({
        method: "post",
        url: "/api/cliente",
  	    data: {
          nombreCompleto: this.masivo.nombre,
          email: this.masivo.email,
          telefono1: this.masivo.telefono,
          pais: this.masivo.pais.toUpperCase()
        }
      }).then(resp => {
        if (resp.data.result == 200) {
          if (resp.data.accion == "INSERT") {
            this.masivo.rows.push({
              id: this.masivo.rows.length + 1,
              nombre: this.masivo.nombre,
              email: this.masivo.email,
              telefono: this.masivo.telefono,
              pais: this.masivo.pais.toUpperCase(),
              enviado: '',
            })
            this.$q.notify({
              message: "Cliente agregado correctamente"
            })
          } else {
            if (index >= 0) {
              this.masivo.rows[index].id = index
              this.masivo.rows[index].nombre = this.masivo.nombre
              this.masivo.rows[index].email = this.masivo.email
              this.masivo.rows[index].telefono = this.masivo.telefono
              this.masivo.rows[index].pais = this.masivo.pais
            }
            this.$q.notify({
              message: "Cliente actualizado correctamente"
            })
          }
        } else {
          this.$q.notify({
            message: "Se ha detectado un inconveniente",
            caption: resp.data.msg
          })
        }
      }).catch(err => {
        this.$q.notify({
          message: "Se detectó un inconveniente",
          caption: err
        })
      }).finally(() => {
        this.loading.addClient = false
      })

    }, // addClient()

    removeClient(item) {
       this.$q.dialog({
        title: item.nombre,
        message: 'El registro se eliminará únicamente de la Tabla y NO de la Base de Datos',
        cancel: true,
        persistent: true,
        cancel: {
          label: "Cancelar",
          color: "white",
          textColor: "primary",
          flat: true,
        }
      }).onOk(() => {
        let index = this.masivo.rows.findIndex(v => (v.email == item.email && v.nombre == item.nombre))
        this.masivo.rows.splice(index, 1)
      }).onCancel(() => {
        // console.log('>>>> Cancel')
      })

    }, // removeClient()

    removeClients() {
      let seleccion = this.masivo.selected.map(v => v.id)
      let idx
      for (let index = 0; index < seleccion.length; index++) {
        idx = this.masivo.rows.findIndex(v => v.id == seleccion[index])
        this.masivo.rows.splice(idx, 1)
      }

      this.masivo.selected = []

    }, // removeClients()

    async envioMasivo() {

      this.loading.masivo = true

      let url = (this.masivo.tipo == "email") ? "/api/enviarEmail" : "/api/enviarSMS"
      let resp

      // Limpio la columna "enviado" para procesar
      this.masivo.rows = this.masivo.rows.map((v) => ({
        id: v.id,
        nombre: v.nombre,
        email: v.email,
        telefono: v.telefono,
        pais: v.pais,
        enviado: "",
        respuesta: ''
      }))

      for (let index = 0; index < this.masivo.selected.length; index++) {
        const element = this.masivo.selected[index]

        resp = await this.$axios({
          url: url,
          method: "post",
          data: {
            tipoEnvio: "masivo",
            subject: this.masivo.asunto,
            body: this.masivo.cuerpo,
            email: element.email,
            telefono: element.telefono,
            pais: element.pais,
            medio: ""
          }
        })

console.log("respuesta", resp.data)

        if (resp.data.result == 200) {
          if (resp.data.rejected.length > 0) {
            this.masivo.rows[element.id -1].enviado = "Error"
            this.$q.notify({
              message: "No se ha podido realizar el envío",
              caption: resp.data.message
            })
          } else {
            this.masivo.rows[element.id -1].enviado = "Ok"
            this.$q.notify({
              message: "Mensaje enviado correctamente",
              color: 'positive'
            })
          }
        } else if (resp.data.result == 403) {
          this.$q.notify({
            message: "No se ha podido realizar el envío",
            caption: resp.data.message
          })
          this.masivo.rows[element.id -1].enviado = "Error"
        } else {
          this.masivo.rows[element.id -1].enviado = "Error"
          this.$q.notify({
            message: "No se ha podido realizar el envío",
            caption: resp.data.message
          })
        }
        this.masivo.rows[element.id -1].respuesta = resp.data.message
console.log("selected", this.masivo.rows[element.id -1])

        utils.syncDelay(5000) // 5 segundos para enviar

      } // for

      this.loading.masivo = false

    }, // envioMasivo()

    borraPoliza(item) {
      this.$q.dialog({
        title: item.nombre,
        message: `¿Eliminar Póliza ${item.referencia}?`,
        cancel: true,
        persistent: true,
        cancel: {
          label: "Regresar",
          color: "white",
          textColor: "primary",
          flat: true,
          noCaps: true,
        }
      }).onOk(() => {
        let index = this.rows.indexOf(item)
        this.$q.loading.show()
        this.$axios({
          method: "delete",
          url: `/api/poliza/${item.id}`
        }).then(resp => {
          if (resp.data.result == 200) {
            this.rows.splice(index, 1)
            this.$q.notify({
              message: `La póliza ${item.referencia} ha sido borrada`,
              color: "positive"
            })
          }
        }).catch(err => {
          this.$q.notify({
            message: "Se detectó un error",
            caption: err
          })
        }).finally(() => {
          this.$q.loading.hide()
        })
      }).onCancel(() => {
        // console.log('>>>> Cancel')
      })
    }, // borraPoliza()

    generaCSV(orden) {
      this.$q.loading.show()
      /*
      const json = this.rows
        .filter(v => v.telefono != '')
        .map(v => {
          return (orden == 'NOMBRE_TELEFONO') ? {
            asegurado: v.asegurado.replace(/,/g, ''),
            telefono: v.telefono.replace(/-/g, '')
          } : {
            telefono: v.telefono.replace(/-/g, ''),
            asegurado: v.asegurado.replace(/,/g, '')
          }
        })
        .sort((a, b) => a.asegurado > b.asegurado ? 1 : -1)
      */
      let ok = false
      let json = []
      this.$axios({
        method: 'get',
        url: `/api/csv/${orden}`
      }).then(resp => {
        if (resp.data.response == 200) {
          ok = true
          json = resp.data.data
        } else {
          this.$q.notify({
            message: "Error",
            caption: resp.data.msg,
            color: 'warning'
          })
        }
      }).catch(error => {
        this.$q.notify({
          message: "Error",
          caption: `<pre>${error}</pre>`,
          html: true,
          color: 'warning'
        })
      }).finally(() => {
        if (ok) {
          const wb = XLSX.utils.book_new()
          const ws = XLSX.utils.json_to_sheet(json)
          XLSX.utils.book_append_sheet(wb, ws, 'Contactos')
          XLSX.writeFile(wb, 'Contactos.csv')
        }
        this.$q.loading.hide()
      }) // axios

    }, // generaCSV()

  }, // methods

}
</script>
<style lang="sass">
/* width */
::-webkit-scrollbar
  width: 10px

/* Track */
::-webkit-scrollbar-track
  background: #999

/* Handle */
::-webkit-scrollbar-thumb
  /*background: #666 */
  width: 10px
  /*height: 8px*/
  background-color: #666
  /* or add it to the track */

/* Handle on hover */
::-webkit-scrollbar-thumb:hover
  background: #444

  //height: calc(100vh - 120px)

.my-sticky-header-table
  /* height or max-height is important */
  height: 310px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: #C2C2C2

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px

</style>
