"use strict";(self["webpackChunkmbci"]=self["webpackChunkmbci"]||[]).push([[362],{18443:(e,o,l)=>{l.d(o,{Z:()=>a});l(24110);const a={data(){return{txtSingular:"Usuario",txtPlural:"Usuarios",localData:{},id_usuario:"",usuario:"",password:"",passwordConfirm:"",nombre:"",email:"",telefono:"",perfil:{},perfiles:[],rulesId:[e=>!!e||"Campo obligatorio"],rules:[e=>!!e||"Campo obligatorio",e=>(e||"").length<=25||"Máximo 25 caractéres"],selected:[],singleSelect:!1,loading:!0,search:"",columns:[{name:"numero",field:"id_usuario",label:"Número",sortable:!0,align:"center"},{name:"usuario",field:"usuario",label:"usuario",sortable:!0,align:"left"},{name:"nombre",field:"nombre",label:"Nombre",sortable:!0,align:"left"},{name:"email",field:"email",label:"E-mail",sortable:!0,align:"left"},{name:"telefono",field:"telefono",label:"Teléfono",sortable:!0,align:"left"},{name:"perfil",field:"perfil",label:"Perfil",sortable:!0,align:"left"}],rows:[],initialPagination:{sortBy:"nombre",descending:!1,page:1,rowsPerPage:15},dlgEditar:!1,nuevoRegistro:!1,frmValid:!1,loadingSave:!1,loadingId:!1,found:!1,error:!1,errorMessage:""}},mounted(){this.getRecords(),this.$axios({method:"get",url:"api/perfiles"}).then((e=>{this.perfiles=e.data.results})).catch((e=>{console.log("err",e)}))},computed:{computedError(){return 0==this.usuario.length?(this.errorMessage="Campo obligatorio",!0):this.found?(this.errorMessage="El Usuario ya existe",!0):(this.errorMessage="",!1)}},methods:{getRecords(){this.loading=!0,this.$axios(`/api/${this.txtPlural.toLowerCase()}`).then((e=>{404==e.data.result?this.$q.notify({color:"warning",message:"Se detectó un inconveniente con la Base de Datos"}):200==e.data.result&&(this.rows=e.data.results)})).catch((e=>{console.log("Error al leer los registros",e),this.$q.notify({color:"warning",message:"Se detectó un inconveniente con la Base de Datos "+e})})).finally((()=>{this.loading=!1}))},onRowClick(e,o){this.id_usuario=o.id_usuario,this.usuario=o.usuario,this.nombre=o.nombre,this.email=o.email,this.telefono=o.telefono,this.perfil=this.perfiles.find((e=>e.id_perfil==o.id_perfil)),this.nuevoRegistro=!1,this.dlgEditar=!0},buscaRegistro(){if(this.found=!1,this.usuario.length>0){let e=!1;this.loadingId=!0,this.$axios(`/api/${this.txtPlural.toLowerCase()}/?usuario=${this.usuario}`).then((o=>{200==o.data.result?(e=!0,this.found=!0):404==o.data.result&&this.$q.notify({color:"orange-10",message:"Se detectó un inconveniente con la Base de Datos"})})).catch((e=>{console.log("Error al leer los registros",e),this.$q.notify({color:"orange-10",message:"Se detectó un inconveniente con la Base de Datos: "+e})})).finally((()=>{this.loadingId=!1,this.found=e}))}},onSubmit(){this.$refs.frmRegistro.validate().then((e=>{e?(this.loadingSave=!0,this.loading=!0,this.$axios({method:"post",url:`/api/${this.txtSingular.toLowerCase()}_save`,data:{id_usuario:this.id_usuario,usuario:this.usuario,password:this.password,nombre:this.nombre,email:this.email,telefono:this.telefono,id_perfil:this.perfil.id_perfil,nuevoRegistro:this.nuevoRegistro}}).then((e=>{200==e.data.result?this.$q.notify({color:"positive",message:"Registro guardado correctamente"}):404==e.data.result&&this.$q.notify({color:"error",message:"Se detectó un inconveniente con la Base de Datos "+e.data.msg})})).catch((e=>{console.log("Error al actualizar el registro",e)})).finally((()=>{this.dlgEditar=!1,this.loading=!1,this.nuevoRegistro=!1,this.loadingSave=!1,this.getRecords()}))):this.$q.notify({color:"error",message:"No se ha capturado correctamente la información"})}))},onReset(){},agregaRegistro(){this.$refs.frmRegistro&&this.$refs.frmRegistro.resetValidation(),this.id_usuario="",this.usuario="",this.password="",this.passwordConfirm="",this.nombre="",this.email="",this.telefono="",this.perfil=null}}}},72028:(e,o,l)=>{l.d(o,{s:()=>q});var a=l(59835),s=l(86970);const i={class:"absolute-center"},r={class:"text-subtitle1"},t={class:"text-h6 text-light-blue-2"},n={class:"row"},d={class:"col-2"},u={class:"row inline"},m={class:"col-4"},c={class:"col-4"},g={class:"col-4"},p={class:"row"},f={class:"col-8"},h={class:"col-4"},b={class:"row"},w={class:"col-9"},v={class:"col-3"},_={class:"row justify-between q-mt-md"},V={class:"col-3"},R={class:"col-auto"};function q(e,o,l,q,C,W){const x=(0,a.up)("q-space"),$=(0,a.up)("q-icon"),y=(0,a.up)("q-input"),S=(0,a.up)("q-tooltip"),Z=(0,a.up)("q-btn"),k=(0,a.up)("q-table"),U=(0,a.up)("q-card-section"),E=(0,a.up)("q-select"),Q=(0,a.up)("q-separator"),P=(0,a.up)("q-form"),I=(0,a.up)("q-card"),B=(0,a.up)("q-dialog"),D=(0,a.up)("q-page");return(0,a.wg)(),(0,a.j4)(D,{class:"flex column"},{default:(0,a.w5)((()=>[(0,a._)("div",i,[(0,a.Wm)(k,{class:"q-ma-sm",rows:C.rows,columns:C.columns,"row-key":"id_usuario",loading:C.loading,filter:C.search,pagination:C.initialPagination,onRowClick:W.onRowClick},{top:(0,a.w5)((()=>[(0,a._)("span",r,(0,s.zw)(`${C.txtPlural}: ${(new Intl.NumberFormat).format(C.rows.length)}`),1),(0,a.Wm)(x),(0,a.Wm)(y,{dense:"",debounce:"300",modelValue:C.search,"onUpdate:modelValue":o[0]||(o[0]=e=>C.search=e),placeholder:"Buscar"},{append:(0,a.w5)((()=>[(0,a.Wm)($,{name:"search"})])),_:1},8,["modelValue"]),(0,a.Wm)(x),(0,a.Wm)(Z,{class:"q-mt-sm",round:"",color:"positive",icon:"mdi-plus",size:"sm",onClick:o[1]||(o[1]=e=>{C.nuevoRegistro=!0,C.dlgEditar=!0,W.agregaRegistro()})},{default:(0,a.w5)((()=>[(0,a.Wm)(S,{anchor:"top middle",self:"bottom middle"},{default:(0,a.w5)((()=>[(0,a.Uk)("Agregar "+(0,s.zw)(C.txtSingular),1)])),_:1})])),_:1})])),_:1},8,["rows","columns","loading","filter","pagination","onRowClick"])]),(0,a.Wm)(B,{modelValue:C.dlgEditar,"onUpdate:modelValue":o[13]||(o[13]=e=>C.dlgEditar=e)},{default:(0,a.w5)((()=>[(0,a.Wm)(I,{class:(0,s.C_)(e.$q.dark.mode?"bg-dark":""),style:{"max-width":"560px"}},{default:(0,a.w5)((()=>[(0,a.Wm)(U,{class:"bg-primary"},{default:(0,a.w5)((()=>[(0,a._)("div",t,"Información del "+(0,s.zw)(C.txtSingular),1)])),_:1}),(0,a.Wm)(U,null,{default:(0,a.w5)((()=>[(0,a.Wm)(P,{modelValue:C.frmValid,"onUpdate:modelValue":o[12]||(o[12]=e=>C.frmValid=e),onSubmit:W.onSubmit,onReset:W.onReset,class:"q-gutter-md",ref:"frmRegistro"},{default:(0,a.w5)((()=>[(0,a._)("div",n,[(0,a._)("div",d,[(0,a.Wm)(y,{modelValue:C.id_usuario,"onUpdate:modelValue":o[2]||(o[2]=e=>C.id_usuario=e),label:"Número",color:"blue-6",outlined:"",mask:"####","fill-mask":"0","reverse-fill-mask":"",readonly:!0},null,8,["modelValue"])])]),(0,a._)("div",u,[(0,a._)("div",m,[(0,a.Wm)(y,{modelValue:C.usuario,"onUpdate:modelValue":o[3]||(o[3]=e=>C.usuario=e),class:"q-mr-md",label:"Usuario",color:"blue-6",debounce:"400",loading:C.loadingId,onInput:o[4]||(o[4]=e=>W.buscaRegistro()),error:W.computedError,"error-message":C.errorMessage,autofocus:""},null,8,["modelValue","loading","error","error-message"])]),(0,a._)("div",c,[(0,a.Wm)(y,{modelValue:C.password,"onUpdate:modelValue":o[5]||(o[5]=e=>C.password=e),class:"q-mr-md",type:"password",label:"Contraseña",color:"blue-6",disable:!C.nuevoRegistro,rules:[e=>!!e&&C.nuevoRegistro||"Campo obligatorio"]},null,8,["modelValue","disable","rules"])]),(0,a._)("div",g,[(0,a.Wm)(y,{modelValue:C.passwordConfirm,"onUpdate:modelValue":o[6]||(o[6]=e=>C.passwordConfirm=e),type:"password",label:"Confirmar Contraseña",color:"blue-6",disable:!C.nuevoRegistro,rules:[e=>!!e&&C.nuevoRegistro||"Campo obligatorio",e=>e==C.password||"La contraseña no coincide"]},null,8,["modelValue","disable","rules"])])]),(0,a._)("div",p,[(0,a._)("div",f,[(0,a.Wm)(y,{modelValue:C.nombre,"onUpdate:modelValue":o[7]||(o[7]=e=>C.nombre=e),class:"q-mr-md",color:"info",label:"Nombre",maxlength:"45",rules:C.rules},null,8,["modelValue","rules"])]),(0,a._)("div",h,[(0,a.Wm)(E,{modelValue:C.perfil,"onUpdate:modelValue":o[8]||(o[8]=e=>C.perfil=e),color:"info",options:C.perfiles,"option-value":"id_perfil","option-label":"nombre",label:"Perfil",rules:[e=>!!e||"Campo obligatorio"]},null,8,["modelValue","options","rules"])])]),(0,a._)("div",b,[(0,a._)("div",w,[(0,a.Wm)(y,{modelValue:C.email,"onUpdate:modelValue":o[9]||(o[9]=e=>C.email=e),class:"q-mr-md",color:"info",label:"Email",rules:[e=>!e||/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(e)||"Cuenta de correo incorrecta"]},null,8,["modelValue","rules"])]),(0,a._)("div",v,[(0,a.Wm)(y,{modelValue:C.telefono,"onUpdate:modelValue":o[10]||(o[10]=e=>C.telefono=e),color:"info",label:"Teléfono",maxlength:"15",mask:"(###) ###-####"},null,8,["modelValue"])])]),(0,a.Wm)(Q),(0,a._)("div",_,[(0,a._)("div",V,[(0,a.Wm)(Z,{label:"Regresar",onClick:o[11]||(o[11]=e=>C.dlgEditar=!1)})]),(0,a._)("div",R,[(0,a.Wm)(Z,{type:"submit",label:"Guardar",color:"primary"})])])])),_:1},8,["modelValue","onSubmit","onReset"])])),_:1})])),_:1},8,["class"])])),_:1},8,["modelValue"])])),_:1})}},4362:(e,o,l)=>{l.r(o),l.d(o,{default:()=>R});var a=l(14882),s=l(44633),i=l(11639),r=l(30718),t=l(56442),n=l(7358),d=l(3898),u=l(79968),m=l(49480),c=l(99675),g=l(80447),p=l(84498),f=l(56597),h=l(61451),b=l(76923),w=l(94935),v=l(69984),_=l.n(v);const V=(0,i.Z)(s.Z,[["render",a.s]]),R=V;_()(s.Z,"components",{QPage:r.Z,QTable:t.Z,QSpace:n.Z,QInput:d.Z,QIcon:u.Z,QBtn:m.Z,QTooltip:c.Z,QDialog:g.Z,QCard:p.Z,QCardSection:f.Z,QForm:h.Z,QSelect:b.Z,QSeparator:w.Z})},44633:(e,o,l)=>{l.d(o,{Z:()=>a.Z});var a=l(18443)},14882:(e,o,l)=>{l.d(o,{s:()=>a.s});var a=l(72028)}}]);