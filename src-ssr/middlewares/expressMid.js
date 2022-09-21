import { ssrMiddleware } from 'quasar/wrappers'
import express from 'express'
import Sequelize from 'sequelize'
import axios from 'axios'
import sha1 from 'sha1'
import { server } from './config'
import fs from 'fs'
import nodeMailer from 'nodemailer'
import { error } from 'console'

// Configuración Twilio
const accountSid = 'AccountSid' // process.env.TWILIO_ACCOUNT_SID;
const authToken = 'AuthToken'   // process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const sqlApi = new Sequelize({
  dialect: 'mysql',
  host: server.host,
  username: server.userName,
  password: server.password,
  database: server.database,
  logging: false,
  timezone: '-07:00', //for writing to database
  dialectOptions:{
    multipleStatements: true,
    //useUTC: false, //for reading from database
    dateStrings: true,
    typeCast: true
    /*
    options: {
      requestTimeout: 50000
      trustServerCertificate: true,
      encrypt: false
    }
    */
  },
})

const mailConfig = {
  //service: 'gmail',
  host: 'smtp.gmail.com', //'smtpout.secureserver.net', //
  //port: 587,    // 465
  auth: {
      user: 'email@gmail.com',
      pass: 'emailpassword',
  },
  tls: {
    rejectUnauthorized: false
  }
}

const mdi = (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-access-token, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', true)

  console.log('-------------------------------------------------------');
  console.log(new Date().toLocaleString('es-MX', {timeZone: "America/Tijuana"}));
  console.log('req.query', req.query);
  console.log('req.body', req.body);
  console.log('req.params', req.params);
  next();
}


const ctrlError = (err, method, route) => {
  let cadena = `Error en /api/${route} | Método ${method} \r\n`
  if (err.code) {
    cadena += err.code + "\r\n"
  }
  if (err.message) {
    cadena += err.message
  }
  return cadena
}

const syncDelay = (milliseconds) => {
  var start = new Date().getTime();
  var end=0;
  while( (end-start) < milliseconds){
      end = new Date().getTime();
  }
}

//const sendEmail = (correos, cc = '', txtClasificacion, subject, body, qry) => {
const sendEmail = async (jsonOpciones) => {

  let transporter = null
  let mailOptions = null
  let info
  let fecha = new Date().toLocaleString('fr-FR').replace(/\//g, '-')
  let json = {}
  let results

  /*
  jsonOpciones = {
    id: id,
    poliza: poliza,
    asegurado: asegurado,
    email: email,
    subject: `Póliza ${jsonOpciones.poliza}`,
    body: body,
    liga: liga
  }
  */

  jsonOpciones.subject = `Póliza ${jsonOpciones.poliza}`
  jsonOpciones.body = `
    <div style="font-family: Verdana;">
      Hola <strong>${jsonOpciones.asegurado}</strong>: <br><br>
      <p style="text-align: justify; text-justify: inter-word;">
        <strong>My Best Car Insurance</strong> agradece mucho la compra de tu Póliza #${jsonOpciones.poliza} para tu
        ${jsonOpciones.marca} ${jsonOpciones.descripcion} ${jsonOpciones.modelo}, ésta Póliza vence en ${jsonOpciones.fExpiracion}
        por ello tenemos una propuesta para ti. Queremos que siempre estés protegido y no te quedes sin cobertura.
      </p>
      Llámanos a:
      <ul>
        <li>(USA) 858 910 2149</li>
        <li>(México) 664 904 0055</li>
      </ul>
      para resolver todas tus dudas y darte el servicio y protección que mereces.<br>
      <p>
        Presiona <a href="${jsonOpciones.liga}">Aqui</a> para descargar tu Póliza en formato PDF.
      </p>
      <p>Muchas gracias.</p>
    </div>
    `

  console.log("Iniciando envío", fecha, "email" , jsonOpciones.email, "subject", jsonOpciones.subject)

  //syncDelay(1200)

  try {
    mailOptions = {
      from: `My Best Car Insurance ${mailConfig.auth.user}`, // sender address
      to: jsonOpciones.email, // list of receivers
      cc: jsonOpciones.cc,
//      bcc: 'ventaschaparral@mybestcarinsurance.com,segurosbinacional@gmail.com,operez2000@gmail.com',
      subject: jsonOpciones.subject,   // `${txtClasificacion} // Encuesta ${surveyDetail.responseId} // ${fechaHora}`, // Subject line
      html: jsonOpciones.body // plain text body
    }
    //process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
    transporter = nodeMailer.createTransport(mailConfig)
    info = await transporter.sendMail(mailOptions)    //, (error, info) => {

    // Todo bien, afecto a la BD
    console.log("Aceptado:", info.accepted, info.accepted.length);

    if (info.accepted.length > 0) {
      console.log("accepted", info.accepted)
    } else {
      console.log("Not accepted")
    }

    // Agrego los envíos rechazados al log
    if (info.rejected.length > 0) {
      console.log("Rechazados", info.rejected)
    }
    syncDelay(1500)

  } catch (err) {
    console.log("Error al enviar correo sendEmail() (catch)\r\n", err)
    let txtError = (typeof err == 'object') ? JSON.stringify(err) : err
    fs.writeFileSync("error-envio.log", `${fecha}\r\n ${txtError}\r\n`, {flag: 'a'})

  } finally {
    console.log("finally en sendEmail()", fecha)
    console.log('---------------------------------------------------------------')
    syncDelay(1200)

  }

} // sendEmail()


// Pie de página para correos
const emailSignature = () => {
  return `
    <div style="font-family: Verdana; font-size: 0.85em;">
      <br><hr>
      Please call us at / Llámanos a:
      <ul>
        <li> (USA) 858 910 2149 </li>
        <li> (Mexico) 664 904 0055 </li>
      </ul>
      to solve all your doubts and give you the service and protection you deserve. / Para resolver todas tus dudas y darte el servicio y protección que mereces.<br>
      Visit us at <strong>mybestcarinsurance.com</strong><br><br>

      <hr>

      <p>Please scan the following QR codes and buy your Tourist Car Policy / Escanea los siguientes códigos QR y compra tu Póliza de Auto Turista:</p>

      <img src="cid:qr_chubb" width="200" alt="Cotizador / Free Quote" />
      <img src="cid:qr_gnp" width="200" alt="Cotizador / Free Quote" />
      <br>
      <img src="cid:logo_verde" width="300" alt="" />
      <br>
      <img src="cid:logos" width="200" alt="" />
      <br><br>
      <p></p>
      <p>Follow us at: / Siguenos en:</p>
      <a href="https://www.facebook.com/segurosdeautotijuana/">
        <img src="cid:facebook" width="50" alt="" />
      </a>
      <a href="https://www.instagram.com/mybestcarinsurance/">
        <img src="cid:instagram" width="50" alt="" />
      </a>
      <a href="https://l.facebook.com/l.php?u=https%3A%2F%2Fapi.whatsapp.com%2Fsend%3Fphone%3D16198563255%26app%3Dfacebook%26entry_point%3Dpage_cta%26fbclid%3DIwAR0Ak4HdMSEqEKGljWhJVbRRXn9oJNhi8CBd7jSoziOlMzemXqDI0Mt7fKc&h=AT1mJCSX8trLTH96M7mfmV8EoD1LcDSvmhC7tL6JGphJToYeopyZCMKfIQv_Nw9gJF28qCNU7XqpmAyXjzFdvPo8JekTdMCeXbFxWME3KViUoOCuYiMMEkoo4ytaVPGusP_p4zAN4-yBBQH-ye85irJrWggwd2A2">
        <img src="cid:whatsapp" width="50" alt="" />
      </a>
      <br>
    </div>
  `
} // emailSignature()


// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/developing-ssr/ssr-middlewares
export default ssrMiddleware(async ({ app /*, resolveUrlPath, publicPath, render */ }) => {

  // Body parser -> Express
  app.use(express.json({ limit: '50mb', extended: true }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Búsqueda de surveys
  app.use("/api/test", mdi, (req, res) => {
    /*
    let json = {}
    axios({
      url: 'https://www.gnpcrossborder.com/gnp/reportes/generaReporte.php?reporteId=1&searchBy=1&filtro=-1&dateBy=POL_CREATED_DATE&fechaInicio=01/01/2021&fechaFin=10/11/2021&rnd=0.8016615793258974',
      method: 'get'
    }).then(resp => {
      json.data = resp
    }).catch(err => {
      json.data = err
    }).finally(() => {
      res.json(json)
    })
*/

    res.json({
      response: 200,
      msg: "Ok"
    })

    sendEmail({
      email: "operez2000@gmail.com",
      cc: "opereznet@hotmail.com",
      subject: "Subject de Prueba",
      asegurado: "Cliente de Prueba",
      poliza: "123456",
      marca: "Marca",
      descripcion: "Descripción",
      modelo: "Modelo",
      fExpiracion: "2022-01-13",
      liga: "www.google.com"
    })

/*
    axios({
      method: 'get',
      //baseURL: `https://www.gnpcrossborder.com/gnp/reportes/generaReporte.php?reporteId=1&searchBy=1&filtro=-1&dateBy=POL_CREATED_DATE&fechaInicio=09/01/2021&fechaFin=09/29/2021&rnd=0.023368817151875998`
      baseURL: 'https://chubbcrossborder.com/chubb/reportes/generaReporte.php?reporteId=1&searchBy=1&filtro=-1&dateBy=POL_CREATED_DATE&fechaInicio=09/01/2021&fechaFin=09/28/2021&token=a7288e56f0e2932f9b271a730d1df875&rnd=0.3140104757180797'
    }).then(resp => {
      console.log("resp", resp.data)
      json.data = resp.data
    }).catch(err => {
      console.log("Err", err)
      json.err = err
    }).finally(() => {
      console.log("Finally")
      res.json(json)
    })
*/
  }); // /api/test


  // Búsqueda de recolectores
  app.use("/api/aseguradoras", mdi, (req, res) => {
    let json = {};
    let qry = `
      SELECT id, nombre, web, contacto1, contacto2, email1, email2, initData
      FROM aseguradoras
      ORDER BY nombre
    `
    sqlApi.query(qry).then( ([results, metadata]) => {
      json.result = (results.length > 0) ? 200 : 500
      json.results = results
      json.msg = (results.length > 0) ? 'Ok' : 'No se encontraron registros'
    }).catch( error => {
      json.result = 404
      json.msg = ctrlError(error, req.route.stack[0].method, req.route.path)
      json.results = error
    }).finally( () => {
      res.json(json)
    })

  }) // /api/aseguradoras/


  // INSERT/UPDATE - Pólizas
  app.post("/api/poliza", mdi, async (req, res) => {
    let json = {}
    let qry
    let results

    req.body.fecha = (!req.body.fecha || req.body.fecha == undefined || req.body.fecha == null || req.body.fecha == 'Invalid Date') ? null : `'${req.body.fecha}'`
    req.body.fEfectiva = (!req.body.fEfectiva || req.body.fEfectiva == undefined || req.body.fEfectiva == null || req.body.fEfectiva == 'Invalid Date') ? null : `'${req.body.fEfectiva}'`
    req.body.fExpiracion = (!req.body.fExpiracion || req.body.fExpiracion == undefined || req.body.fExpiracion == null || req.body.fExpiracion == 'Invalid Date') ? null : `'${req.body.fExpiracion}'`
    req.body.fCancelacion = (!req.body.fCancelacion || req.body.fCancelacion == undefined || req.body.fCancelacion == null || req.body.fCancelacion == 'Invalid Date') ? null : `'${req.body.fCancelacion}'`
    req.body.fNacimiento = (!req.body.fNacimiento || req.body.fNacimiento == undefined || req.body.fNacimiento == null || req.body.fNacimiento == 'Invalid Date') ? null : `'${req.body.fNacimiento}'`

    try {
      qry = `
        SELECT id FROM polizas WHERE (idAseguradora = ${req.body.idAseguradora}) AND (referencia = '${req.body.referencia}')
      `
      json.qry = qry
      results = await sqlApi.query(qry)
console.log("results", results)
      if (results[0] && results[0].length == 0) {
        // El registro no existe
        qry = `
          INSERT INTO polizas (
            idAseguradora,
            poliza,
            referencia,
            producto,
            descProducto,
            tipo,
            fecha,
            asegurado,
            fEfectiva,
            fExpiracion,
            agente,
            vendedor,
            neto,
            tarifa,
            totalPoliza,
            tarifaAgente,
            tarifaProceso,
            refUID,
            metodoPago,
            estatus,
            fCancelacion,
            tipoVehiculo,
            valorDeclarado,
            modelo,
            marca,
            descripcion,
            vin,
            placas,
            fNacimiento,
            territorio,
            domicilio,
            ciudad,
            estado,
            cp,
            telefono,
            email,
            fechaRegistro
          )
          VALUES (
            ${req.body.idAseguradora},
            '${req.body.poliza}',
            '${req.body.referencia}',
            '${req.body.producto}',
            '${req.body.descProducto}',
            '${req.body.tipo}',
            ${req.body.fecha},
            '${req.body.asegurado}',
            ${req.body.fEfectiva},
            ${req.body.fExpiracion},
            '${req.body.agente}',
            '${req.body.vendedor}',
            ${req.body.neto},
            ${req.body.tarifa},
            ${req.body.totalPoliza},
            ${req.body.tarifaAgente},
            ${req.body.tarifaProceso},
            '${req.body.refUID}',
            '${req.body.metodoPago}',
            '${req.body.estatus}',
            ${req.body.fCancelacion},
            '${req.body.tipoVehiculo}',
            ${req.body.valorDeclarado},
            '${req.body.modelo}',
            '${req.body.marca}',
            '${req.body.descripcion}',
            '${req.body.vin}',
            '${req.body.placas}',
            ${req.body.fNacimiento},
            '${req.body.territorio}',
            '${req.body.domicilio}',
            '${req.body.ciudad}',
            '${req.body.estado}',
            '${req.body.cp}',
            '${req.body.telefono}',
            '${req.body.email}',
            current_timestamp()
          );
        `
      } else {
        // Registro existente
        `
          UPDATE polizas
          SET
            referencia =  '${req.body.referencia}',
            producto =  '${req.body.producto}',
            descProducto =  '${req.body.descProducto}',
            tipo =  '${req.body.tipo}',
            fecha =  ${req.body.fecha},
            asegurado =  '${req.body.asegurado}',
            fEfectiva =  ${req.body.fEfectiva},
            fExpiracion =  ${req.body.fExpiracion},
            agente =  '${req.body.agente}',
            vendedor =  '${req.body.vendedor}',
            neto =  ${req.body.neto},
            tarifa =  ${req.body.tarifa},
            totalPoliza =  ${req.body.totalPoliza},
            tarifaAgente =  ${req.body.tarifaAgente},
            tarifaProceso =  ${req.body.tarifaProceso},
            refUID =  '${req.body.refUID}',
            metodoPago =  '${req.body.metodoPago}',
            estatus =  '${req.body.estatus}',
            fCancelacion =  ${req.body.fCancelacion},
            tipoVehiculo =  '${req.body.tipoVehiculo}',
            valorDeclarado =  ${req.body.valorDeclarado},
            modelo =  '${req.body.modelo}',
            marca =  '${req.body.marca}',
            descripcion =  '${req.body.descripcion}',
            vin =  '${req.body.vin}',
            placas =  '${req.body.placas}',
            fNacimiento =  ${req.body.fNacimiento},
            territorio =  '${req.body.territorio}',
            domicilio =  '${req.body.domicilio}',
            ciudad =  '${req.body.ciudad}',
            estado =  '${req.body.estado}',
            cp =  '${req.body.cp}',
            telefono =  '${req.body.telefono}',
            email =  '${req.body.email}'
          WHERE (idAseguradora = ${req.body.idAseguradora}) AND (referencia = '${req.body.referencia}')
        `
      }

      results = await sqlApi.query(qry)
      json.result = 200
      json.msg = 'Ok'
      json.results = await results

    } catch (error) {
      json.result = 404
      json.msg = ctrlError(error, req.route.stack[0].method, req.route.path)
      json.results = error
      fs.writeFileSync("errorCarga.log", `${fecha}\r\n ${json.msg}\r\n`, {flag: 'a'})

    } finally {
      res.json(json)

    }

  }) // app.post("/api/poliza")

  app.get("/api/polizas", mdi, (req, res) => {
    let json = {}
    let idAseguradora = req.query.idAseguradora || 1
    let qry = `
      SELECT
        p.id, poliza, referencia, descProducto, date_format(fecha, '%Y-%m-%d') fecha, asegurado, telefono, email, date_format(fEfectiva, '%Y-%m-%d') fEfectiva,
        date_format(fExpiracion, '%Y-%m-%d') fExpiracion, datediff( now(), fExpiracion) diasExpiracion, vendedor, totalPoliza, valorDeclarado,
        tipo, modelo, marca, descripcion, vin, CASE WHEN p.fCancelacion IS NULL THEN '' ELSE Date_Format(p.fCancelacion, '%Y-%m-%d') END fCancelacion,
        CASE WHEN p.fNacimiento IS NULL THEN '' ELSE Date_Format(p.fNacimiento, '%Y-%m-%d') END fNacimiento,
        CASE WHEN p.ultimoEmail IS NULL THEN '' ELSE Date_Format(p.ultimoEmail, '%Y-%m-%d %H:%i') END ultimoEmail,
        CASE WHEN p.ultimoSMS IS NULL THEN '' ELSE Date_Format(p.ultimoSMS, '%Y-%m-%d %H:%i') END ultimoSMS,
        CASE WHEN p.ultimoWhatsApp IS NULL THEN '' ELSE Date_Format(p.ultimoWhatsApp, '%Y-%m-%d %H:%i') END ultimoWhatsApp,
        CASE WHEN p.observaciones IS NULL THEN '' ELSE observaciones END observaciones
      FROM polizas p
      WHERE p.idAseguradora = ${idAseguradora}
      ORDER BY p.id
    `
    sqlApi.query(qry).then(([results]) => {
      json.result = (results.length > 0) ? 200 : 500
      json.msg = (results.length > 0) ? "Ok" : "No se encontraron registros"
      json.results = results
    }).catch(error => {
      json.result = 404
      json.msg = ctrlError(error, req.route.stack[0].method, req.route.path)
      json.results = error
    }).finally(() => {
      res.json(json)
    })
  }) // app.get("/api/polizas")


  app.post('/api/login', mdi, (req, res) => {
    let json = {};
    let qry = `
      SELECT u.id_usuario, u.usuario, u.nombre, u.email, u.telefono, u.id_perfil, p.nombre perfil
      FROM usuarios u
        INNER JOIN perfiles p ON u.id_perfil = p.id_perfil
      WHERE ( (u.usuario = '${req.body.userId}') OR (u.email = '${req.body.userId}') ) AND (u.password = '${sha1(req.body.password)}')
    `
    sqlApi.query(qry).then( ([results, metadata]) => {
      json.result = (results.length > 0) ? 200 : 500
      json.results = results
      json.msg = (results.length > 0) ? 'Ok' : 'Usuario inexistente'
    }).catch( error => {
      json.result = 404
      json.msg = ctrlError(error, req.route.stack[0].method, req.route.path)
      json.results = error
    }).finally( () => {
      res.json(json)
    })
  }) // /api/login


  // Get password
  app.post('/api/pass', mdi, (req, res) => {
    let json = {}
    let qry = `SELECT password FROM usuarios WHERE usuario = '${req.body.userId}'`
    sqlApi.query(qry).then( ([results, metadata]) => {
      json.result = (results.length > 0) ? 200 : 500
      json.results = (results.length > 0) ? results[0] : ''
      json.msg = (results.length > 0) ? "Ok" : "No existe"
    }).catch( error => {
      json.result = 404;
      json.msg = ctrlError(error, req.route.stack[0].method, req.route.path)
      json.results = error
    }).finally( () => {
      res.json(json)
    })
  }) // /api/pass  (get password)


  // Update password
  app.post('/api/update_pass', mdi, (req, res) => {
    let json = {};
    let qry = `UPDATE usuarios SET password = '${req.body.pass}' WHERE usuario = '${req.body.usuario}' `
    sqlApi.query(qry).then( ([results, metadata]) => {
      json.result = 200
      json.results = results
      json.msg = 'La contraseña se actualizó correctamente'
    }).catch( error => {
      json.result = 404;
      json.msg = ctrlError(error, req.route.stack[0].method, req.route.path)
      json.results = error
    }).finally( () => {
      res.json(json)
    });
  }); // /update_pass


  // Usuarios
  app.get('/api/usuarios', mdi, (req, res) => {

    let json = {}
    let qry = `
      SELECT
        CAST(u.id_usuario AS character) id_usuario, u.usuario, u.nombre, u.email, u.telefono, u.id_perfil, p.nombre perfil
      FROM usuarios u
        INNER JOIN perfiles p ON u.id_perfil = p.id_perfil
    `
    if (req.query.id_usuario && req.query.id_usuario != '') {
      qry += `WHERE id_usuario = ${req.query.id_usuario} `
    } else if (req.query.usuario && req.query.usuario != '') {
      qry += `WHERE usuario = '${req.query.usuario}' `
    }
    qry += `ORDER BY u.nombre`

    sqlApi.query(qry).then(([results, metadata]) => {
      json.result = (results.length == 0) ? 500 : 200
      json.msg = (results.length == 0) ? "No se encontraron Usuarios" : "Usuarios: " + results.length
      json.results = results;
    }).catch( error => {
      json.result = 404;
      json.msg = ctrlError(error, req.route.stack[0].method, req.route.path)
      json.results = error
    }).finally( () => {
      res.json(json)
    })
  }) / //api/usuarios


  // Actualiza usuarios
  app.post('/api/usuario_save', mdi, (req, res) => {
    let json = {}
    let password = sha1(req.body.password)
    let qry = ''
    if (req.body.nuevoRegistro) {
      qry = `
        INSERT INTO usuarios
          (usuario, password, nombre, email, telefono, id_perfil, fecha)
        VALUES
          ('${req.body.usuario}', '${password}', '${req.body.nombre}', '${req.body.email}', '${req.body.telefono}', '${req.body.id_perfil}', NOW() )
        ON DUPLICATE KEY UPDATE usuario='${req.body.usuario}', nombre='${req.body.nombre}', email='${req.body.email}', telefono='${req.body.telefono}', id_perfil='${req.body.id_perfil}'
      `
    } else {
      qry = `
        UPDATE usuarios
        SET usuario = '${req.body.usuario}', nombre = '${req.body.nombre}', email = '${req.body.email}', telefono = '${req.body.telefono}', id_perfil = '${req.body.id_perfil}'
        WHERE id_usuario = ${req.body.id_usuario}
      `
    }
    sqlApi.query(qry).then( ([results, metadata]) => {
      json.result = 200
      json.results = results
      json.msg = 'Ok'
    }).catch( error => {
      json.result = 404
      json.msg = ctrlError(error, req.route.stack[0].method, req.route.path)
      json.results = error
      json.qry = qry
    }).finally( () => {
      res.json(json)
    })
  }) // /api/usuario_save


  // Perfiles
  app.use('/api/perfiles', mdi, (req, res) => {
    let json = {}
    let qry = `
      SELECT *
      FROM perfiles
    `
    sqlApi.query(qry).then(([results, metadata]) => {
      json.result = (results.length == 0) ? 500 : 200
      json.msg = (results.length == 0) ? "No se encontraron Perfiles" : "Perfiles: " + results.length
      json.results = results;
    }).catch( error => {
      json.result = 404;
      json.msg = ctrlError(error, req.route.stack[0].method, req.route.path)
      json.results = error
    }).finally( () => {
      res.json(json)
    })
  }) // /api/perfiles

  app.post("/api/enviarEmail", mdi, async (req, res) => {
    let transporter
    let mailOptions
    let info
    let fecha = new Date().toLocaleString('fr-FR').replace(/\//g, '-')
    let json = {}
    let results

    /*
    req.body = {
      id: id,
      poliza: poliza,
      asegurado: asegurado,
      email: email,
      subject: `Póliza ${req.body.poliza}`,
      body: body,
      liga: liga
    }
    */

    console.log("Iniciando envío por Email", fecha, "email" , req.body.email, "subject", req.body.subject)

   //syncDelay(1200)

    try {
      if (req.body.tipoEnvio == "vencimiento") {
        req.body.subject = `Renew your Policy ${req.body.referencia} / Renueva tu Póliza ${req.body.referencia} `
        req.body.body = `
          <div style="font-family: Verdana;">
            Hello <strong>${req.body.asegurado}</strong>: <br>
            <p style="text-align: justify; text-justify: inter-word;">
              Your Policy #${req.body.referencia} for your car
              ${req.body.marca} ${req.body.descripcion} ${req.body.modelo} expires in ${req.body.fExpiracion} therefore we have a proposal for you. We want you to always be protected and not be left without coverage.
            </p>

        `
        if (req.body.idAseguradora == 1) {  // Chubb si tiene liga para descarga
          req.body.body += `
            <p>
              Press <a href="${req.body.liga}">Here</a> to download your Policy in PDF format.
            </p>
            `
        }
        req.body.body += `
            <p> Thank you very much.</p>
            <hr><br>
            Hola <strong>${req.body.asegurado}</strong>: <br>
            <p style="text-align: justify; text-justify: inter-word;">
              Tu Póliza #${req.body.referencia} para tu auto ${req.body.marca} ${req.body.descripcion} ${req.body.modelo} vence en ${req.body.fExpiracion}
              por ello tenemos una propuesta para ti. Queremos que siempre estés protegido y no te quedes sin cobertura.
            </p>
        `
        if (req.body.idAseguradora == 1) {  // Chubb si tiene liga para descarga
          req.body.body += `
            <p>
              Presiona <a href="${req.body.liga}">Aquí</a> para descargar tu Póliza en formato PDF.
            </p>
          `
        }
        req.body.body += `
            <p>Muchas gracias.</p>
          </div>
        `
        req.body.body += emailSignature()

      } else if (req.body.tipoEnvio == "agradecimiento") { // Agradecimiento
        req.body.subject = `Thanks for your purchase of Policy ${req.body.referencia} / Gracias por la compra de tu Póliza ${req.body.referencia} `
        req.body.body = `
          <div style="font-family: Verdana;">
            Hello <strong>${req.body.asegurado}</strong>: <br>
            <p style="text-align: justify; text-justify: inter-word;">
              <strong>My Best Car Insurance</strong> appreciates the purchase of your Policy #${req.body.referencia} for your car
              ${req.body.marca} ${req.body.descripcion} ${req.body.modelo}, this Policy expires in ${req.body.fExpiracion}.
        `
        if (req.body.idAseguradora == 1) { // Chubb si tiene liga de descarga
          req.body.body += `
            We are sending it to you <a href="${req.body.liga}">here</a> so you can always be protected.
          `
        }
        req.body.body += `
              It is an honor to have clients like you.
            </p>
            <p> Thank you very much.</p><br>
            <hr><br>
            Hola <strong>${req.body.asegurado}</strong>: <br>
            <p style="text-align: justify; text-justify: inter-word;">
              <strong>My Best Car Insurance</strong> agradece mucho la compra de tu Póliza #${req.body.referencia} para tu auto
              ${req.body.marca} ${req.body.descripcion} ${req.body.modelo}, ésta Póliza vence en ${req.body.fExpiracion}.
        `
        if (req.body.idAseguradora == 1) { // Chubb si tiene liga de descarga
          req.body.body += `
            <a href="${req.body.liga}">Aquí</a> te la enviamos para que la tengas a la mano y siempre estés protegido/a.<br>
          `
        }
        req.body.body += `
              Es un honor tener clientes como tú.
            </p>
            <p>Muchas gracias.</p>
          </div>
        `
        req.body.body += emailSignature()
        /*
          <img src="cid:qr_chubb" width="200" alt="Cotizador / Free Quote" />
          <img src="cid:qr_gnp" width="200" alt="Cotizador / Free Quote" />
          <br>
          <img src="cid:logo_verde" width="300" alt="" />
          <br>
          <img src="cid:logos" width="200" alt="" />
        `
        */
      } else if (req.body.tipoEnvio == "libre") {
       req.body.subject = `Dear Customer / Estimado Cliente `
       req.body.body = req.body.txtLibre
       req.body.body += emailSignature()
       /*`
        <hr>
        <img src="cid:qr_chubb" width="200" alt="Cotizador / Free Quote" />
        <img src="cid:qr_gnp" width="200" alt="Cotizador / Free Quote" />
        <br>
        <img src="cid:logo_verde" width="300" alt="" />
        <br>
        <img src="cid:logos" width="200" alt="" />
        <br><br>
       `*/

      } else if (req.body.tipoEnvio == "masivo") {
        req.body.body = req.body.body.replace(/\n|\r/g, "<br>")
        req.body.body += emailSignature()
        /*`
          <hr>
          <img src="cid:qr_chubb" width="200" alt="Cotizador / Free Quote" />
          <img src="cid:qr_gnp" width="200" alt="Cotizador / Free Quote" />
          <br>
          <img src="cid:logo_verde" width="300" alt="" />
          <br>
          <img src="cid:logos" width="200" alt="" />
          <br><br>
        `*/

      }


/*
Escanea los siguientes códigos QR y compra tu póliza de auto turista.
TEL: + 1 858-910-2149 USA
TEL: +52 664-904-0055 MEX
http://mybestcarinsurance.com/
Llámanos para cualquier duda.
*/


/*
     req.body.body = `Estimado/a ${req.body.asegurado}, este correo es para enviarle su Póliza #${req.body.poliza}.<br><br>
                        Presione <a href="${req.body.liga}"><strong><i>aquí</i></strong></a> para descargarla en formato PDF.<br><br>
                        Quedamos a sus órdenes en los siguientes números telefónicos:
                        <ul>
                          <li>(USA) +1 858 910 2149</li>
                          <li>(México) +52 664 904 0055</li>
                        </ul>
                        <br>
                        Gracias por su preferencia.<br><br>
                        <img src="cid:logo" width="200" alt="" />
                        `
*/
      mailOptions = {
        from: `My Best Car Insurance ${mailConfig.auth.user}`, // sender address
        to: req.body.email, // list of receivers
        cc: req.body.cc,
        bcc: '', //'ventaschaparral@mybestcarinsurance.com', // 'ventaschaparral@mybestcarinsurance.com,segurosbinacional@gmail.com,operez2000@gmail.com',
  //       bcc: 'operez2000@gmail.com',
        subject: req.body.subject,   // `${txtClasificacion} // Encuesta ${surveyDetail.responseId} // ${fechaHora}`, // Subject line
        html: req.body.body, // plain text body
        attachments: [
          {
            filename: 'logos.png',
            path: 'public/logos.png',
            cid: 'logos' //my mistake was putting "cid:logo@cid" here!
          },
          {
            filename: 'logo_verde.jpeg',
            path: 'public/logo_verde.jpeg',
            cid: 'logo_verde' //my mistake was putting "cid:logo@cid" here!
          },
          {
            filename: 'qr_chubb.png',
            path: 'public/qr_chubb.png',
            cid: 'qr_chubb'
          },
          {
            filename: 'qr_gnp.png',
            path: 'public/qr_gnp.png',
            cid: 'qr_gnp'
          },
          {
            filename: 'facebook.jpg',
            path: 'public/facebook.jpg',
            cid: 'facebook'
          },
          {
            filename: 'instagram.jpg',
            path: 'public/instagram.jpg',
            cid: 'instagram'
          },
          {
            filename: 'whatsapp.jpg',
            path: 'public/whatsapp.jpg',
            cid: 'whatsapp'
          }
        ]
      }

      if (req.body.tipoEnvio == "masivo") {
        mailOptions.attachments.push({
          filename: "auto_turista.jpeg",
          path: "public/auto_turista.jpeg",
          cid: "auto_turista"
        })
/*		
        mailOptions.attachments.push({
          filename: "bombay.jpeg",
          path: "public/bombay.jpeg",
          cid: "bombay"
        })
        mailOptions.attachments.push({
          filename: "beach_fest.jpeg",
          path: "public/beach_fest.jpeg",
          cid: "beach_fest"
        })
        mailOptions.attachments.push({
          filename: "papas_beer.jpeg",
          path: "public/papas_beer.jpeg",
          cid: "papas_beer"
        })
*/
      }

      //process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
      transporter = nodeMailer.createTransport(mailConfig)
      info = await transporter.sendMail(mailOptions)    //, (error, info) => {

      // Todo bien, afecto a la BD
      console.log("Aceptado:", info.accepted, info.accepted.length);

      json.result = 200
      json.msg = "El envío se ha realizado correctamente"
      json.accepted = info.accepted
      json.rejected = info.rejected

      if (info.accepted.length > 0) {
        if (req.body.tipoEnvio == "vencimiento" || req.body.tipoEnvio == "agradecimiento") {
          req.body.qry = `
            UPDATE polizas
            SET ultimoEmail = NOW()
            WHERE id = ${req.body.id}
          `
          results = await sqlApi.query(req.body.qry)
          json.results = results[0]
          json.metadata = results[1]
          console.log("Resultados de la afectación en BD - metadata", json.metadata, "results", json.results)
          syncDelay(1500)
        }
      }

      // Agrego los envíos rechazados al log
      if (info.rejected.length > 0) {
        console.log("Rechazados", info.rejected)
        fs.writeFileSync("rechazados.log", `${fecha}\r\n ${info.rejected.toString()}\r\n`, {flag: 'a'})
      }

    } catch (err) {
      let txtError = (typeof err == 'object') ? JSON.stringify(err) : err
      json.result = 403
      json.msg = txtError
      console.log("Error al enviar correo sendEmail() (catch)", err)
      fs.writeFileSync("error-envio.log", `${fecha}\r\n ${txtError}\r\n`, {flag: 'a'})

    } finally {
      console.log("finally en /api/enviarEmail", fecha)
      console.log('---------------------------------------------------------------')
      res.json(json)

    }
  }) // /api/enviarEmail

  // enviarSMS
  app.post("/api/enviarSMS", mdi, async (req, res) => {
    let fecha = new Date().toLocaleString('fr-FR').replace(/\//g, '-')
    let json = {}
    let results
    let message
    let txt = ''

    if (req.body.medio.toUpperCase() == "SMS") {
      req.body.medio = ""
    }
    req.body.medio = (req.body.medio) ? req.body.medio : ""  // default SMS = ""

    // Teléfono   +1 (858) 910-2149 Charis
    req.body.telefono = ((req.body.pais.toUpperCase() == 'US') ? "+1" : "+52") + req.body.telefono.replace(/-|[()]| /g, "")

    /*
      Notas:
        Enviar teléfono del cliente req.body.to
        Especificar medio: SMS (default vacío) / WhatsApp ("whatsapp:")
    */

    /*
    req.body = {
      id: id,
      poliza: poliza,
      asegurado: asegurado,
      telefono: telefono,
      subject: `Póliza ${req.body.poliza}`,
      body: body,
      liga: liga,
      medio: "SMS"   // "whatsapp:"

    }
    */

    console.log("Iniciando envío por SMS", fecha)
    console.log("telefono", req.body.telefono)

   //syncDelay(1200)

    try {

      if (req.body.tipoEnvio == "vencimiento") {

        txt += `Hello ${req.body.asegurado}: \r\n`
        txt += `My Best Car Insurance appreciates the purchase of your Policy #${req.body.referencia} for your car `
        txt += `${req.body.marca} ${req.body.descripcion} ${req.body.modelo}, this Policy expires in ${req.body.fExpiracion} `
        txt += `therefore we have a proposal for you. We want you to always be protected and not be left without coverage.\r\n`
        txt += `Please call us at: \r\n`
        txt += `  (USA) +1 858 910 2149 \r\n`
        txt += `  (Mexico) +52 664 904 0055 \r\n`
        txt += `to solve all your doubts and give you the service and protection you deserve.\r\n`
        txt += `Go to ${req.body.liga} to download your Policy in PDF format. \r\n`
        txt += `Thank you very much. \r\n`
        txt += `\r\n----------------------\r\n`
        txt += `\r\n`

        txt += `Hola ${req.body.asegurado}:  \r\n`
        txt += `My Best Car Insurance agradece mucho la compra de tu Póliza #${req.body.referencia} para tu auto `
        txt += `${req.body.marca} ${req.body.descripcion} ${req.body.modelo}, ésta Póliza vence en ${req.body.fExpiracion} `
        txt += `por ello tenemos una propuesta para ti. Queremos que siempre estés protegido y no te quedes sin cobertura.\r\n`
        txt += `Llámanos a: \r\n`
        txt += `  (USA) +1 858 910 2149 \r\n`
        txt += `  (México) +52 664 904 0055 \r\n`
        txt += `para resolver todas tus dudas y darte el servicio y protección que mereces.\r\n`
        txt += `Entra a ${req.body.liga} para descargar tu Póliza en formato PDF. \r\n`
        txt += `Muchas gracias. \r\n`

      } else if (req.body.tipoEnvio == "agradecimiento") { // Agradecimiento
        txt += `Hello ${req.body.asegurado}: \r\n`
        txt += `My Best Car Insurance appreciates the purchase of your Policy #${req.body.referencia} for your car `
        txt += `${req.body.marca} ${req.body.descripcion} ${req.body.modelo}, this Policy expires in ${req.body.fExpiracion} `
        txt += `We are sending it to you ${req.body.liga} so you can always be protected. It is an honor to have clients like you.\r\n`
        txt += `Thank you very much. \r\n`
        txt += `\r\n----------------------\r\n`
        txt += `\r\n`

        txt += `Hola ${req.body.asegurado}:  \r\n`
        txt += `My Best Car Insurance agradece mucho la compra de tu Póliza #${req.body.referencia} para tu auto `
        txt += `${req.body.marca} ${req.body.descripcion} ${req.body.modelo}, ésta Póliza vence en ${req.body.fExpiracion} `
        txt += `por ello tenemos una propuesta para ti. Queremos que siempre estés protegido y no te quedes sin cobertura.\r\n`
        txt += `Aquí te la enviamos ${req.body.liga} para que la tengas a la mano y siempre estés protegido/a. Es un honor tener clientes como tú.\r\n`
        txt += `Muchas gracias. \r\n`

      } else if (req.body.tipoEnvio == "masivo") {
        txt += req.body.body
      }

      req.body.body = txt

console.log("body", req.body.body)
      json.body = req.body.body
      json.telefono = req.body.telefono

      message = await client.messages.create({
        body: req.body.body,
        from: `${req.body.medio}+17547142944`,
        to: `${req.body.medio}${req.body.telefono}`
      })

      json.message = "Mensaje enviado"
      json.result = 200
      json.rejected = []
      json.accepted = ["Ok"]
      if (req.body.tipoEnvio == "vencimiento" || req.body.tipoEnvio == "agradecimiento") {
        req.body.qry = `
          UPDATE polizas
          SET ultimoSMS = NOW()
          WHERE id = ${req.body.id}
        `
        results = await sqlApi.query(req.body.qry)
        json.results = results[0]
        json.metadata = results[1]
        console.log("Resultados de la afectación en BD - metadata", json.metadata, "results", json.results)
        syncDelay(1500)
      }

    } catch (err) {
      console.log("Error al enviar SMS (catch)", err)
      let txtError = String(err) // (typeof err == 'object') ? JSON.stringify(err) : err
      json.result = 403
      json.message = txtError
//      fs.writeFileSync("error-envio.log", `${fecha}\r\n ${txtError}\r\n`, {flag: 'a'})

    } finally {
      console.log("finally en /api/enviarSMS", fecha)
      console.log('---------------------------------------------------------------')
      res.json(json)

    }

  }) // /api/enviarSMS


  // Actualiza Clientes
  app.post('/api/cliente', mdi, async (req, res) => {
    let json = {}
    let qry = ''
    let results
    let id = null

    if (!req.body.id) {req.body.id = 0}
    if (!req.body.paterno) {req.body.paterno = ""}
    if (!req.body.materno) {req.body.materno = ""}
    if (!req.body.nombre) {req.body.nombre = ""}
    if (!req.body.nombreCompleto) {req.body.nombreCompleto = ""}
    if (!req.body.email) {req.body.email = ""}
    if (!req.body.telefono1) {req.body.telefono1 = ""}
    if (!req.body.telefono2) {req.body.telefono2 = ""}
    if (!req.body.domicilio) {req.body.domicilio = ""}
    if (!req.body.colonia) {req.body.colonia = ""}
    if (!req.body.cp) {req.body.cp = ""}
    if (!req.body.pais) {req.body.pais = ""}

    if (req.body.id == '' || req.body.id == undefined) {
      req.body.id = 0
    }

    id = req.body.id

    try {
      /*
      qry = `
        SELECT id FROM clientes WHERE id = ${req.body.id}
      `
      results = await sqlApi.query(qry)
console.log("results", results)
      */
      if (req.body.nuevoRegistro == true) { // (results[0] && results[0].length == 0) {
        // Registro inexistente, proceso INSERT
        json.accion = "INSERT"
        qry = `
          INSERT INTO clientes
            (paterno, materno, nombre, nombreCompleto, email, telefono1, telefono2, domicilio, colonia, cp, pais, fecha)
          VALUES
            ('${req.body.paterno}', '${req.body.materno}', '${req.body.nombre}', '${req.body.nombreCompleto}', '${req.body.email}',
            '${req.body.telefono1}', '${req.body.telefono2}', '${req.body.domicilio}', '${req.body.colonia}', '${req.body.cp}',
            '${req.body.pais}', NOW() )
        `
      } else {
        //id = await results[0][0].id
        json.accion = "UPDATE"
        qry = `
          UPDATE clientes
          SET paterno = '${req.body.paterno}',
              materno = '${req.body.materno}',
              nombre = '${req.body.nombre}',
              nombreCompleto = '${req.body.nombreCompleto}',
              email = '${req.body.email}',
              telefono1 = '${req.body.telefono1}',
              telefono2 = '${req.body.telefono2}',
              domicilio = '${req.body.domicilio}',
              colonia = '${req.body.colonia}',
              cp = '${req.body.cp}',
              pais = '${req.body.pais}'
          WHERE id = ${id}
        `
      }
console.log('qry', qry)
      await sqlApi.query(qry)
      json.result = 200
      json.msg = "Ok"
      //json.results = results

    } catch(error) {
console.log("error", error)
      json.result = 403
      json.msg = ctrlError(error, req.route.stack[0].method, req.route.path)
      //json.results = []

    } finally {
      res.json(json)
    }

  }) // /api/cliente


  // Borra Cliente
  app.delete('/api/cliente/:id', mdi, (req, res) => {
    let json = {}
    let qry = `DELETE FROM clientes WHERE id = ${req.params.id}`

    sqlApi.query(qry).then(([result, metadata]) => {
      json.response = 200
      json.msg = "Registro eliminado correctamente"
      json.results = metadata
      console.log("meta", metadata)
    }).catch(error => {
      json.response = 403
      json.msg = ctrlError(error, req.route.stack[0].method, req.route.path)
      json.results = []
    }).finally(() => {
      res.json(json)
    })

  }) // /api/cliente (delete)


  // Pólizas - Clientes
  app.get('/api/polizas-clientes/:id', mdi, (req, res) => {
    let json = {}
    let qry

console.log("parametros", req.params.id)

    if (req.params.id == 0) { // Todos
      qry = `
        SELECT asegurado nombre, email, telefono, 'US' pais, idAseguradora
        FROM polizas
        UNION
        SELECT nombreCompleto nombre, email, telefono1 telefono, pais, 999999999 idAseguradora
        FROM clientes
        ORDER BY nombre;
      `
    } else if (req.params.id == 999999999) { // Solo clientes externos
      qry = `
        SELECT nombreCompleto nombre, email, telefono1 telefono, pais, 999999999 idAseguradora
        FROM clientes
        ORDER BY nombre;
      `
    } else {
      qry = `
        SELECT asegurado nombre, email, telefono, 'US' pais, idAseguradora
        FROM polizas
        WHERE idAseguradora = ${req.params.id}
      `
    }

    sqlApi.query(qry).then(([results]) => {
      json.result = (results.length > 0) ? 200 : 500
      for (let index = 0; index < results.length; index++) {
        results[index].id = (index +1)   // agrego id
      }
      json.results = results
      json.msg = (results.length > 0) ? 'Ok' : 'No se encontraron registros'
    }).catch( error => {
      json.result = 404
      json.msg = ctrlError(error, req.route.stack[0].method, req.route.path)
      json.results = error
    }).finally( () => {
      res.json(json)
    }) // aqlApi.query()

  }) // /api/polizas-clientes

  // Clientes
  app.get('/api/clientes', mdi, async (req, res) => {
    let json = {}
    let qry = `
      SELECT id, nombreCompleto, email, telefono1, LOWER(pais) pais
      FROM clientes
      ORDER BY nombreCompleto
    `
    sqlApi.query(qry).then(([results]) => {
      json.result = (results.length > 0) ? 200 : 500
/*
      for (let index = 0; index < results.length; index++) {
        results[index].id = (index +1)   // agrego id
      }
*/
      json.results = results
      json.msg = (results.length > 0) ? 'Ok' : 'No se encontraron registros'
    }).catch( error => {
      json.result = 404
      json.msg = ctrlError(error, req.route.stack[0].method, req.route.path)
      json.results = error
    }).finally( () => {
      res.json(json)
    }) // aqlApi.query()

  }) // /api/polizas-clientes

  // Cliente get
  app.get('/api/cliente/:id', mdi, (req, res) => {
    let json = {}
    let qry = `
      SELECT id, nombreCompleto, email, telefono1, LOWER(pais) pais
      FROM clientes
      WHERE id = ${req.params.id}
    `
    sqlApi.query(qry).then(([results]) => {
      json.result = (results.length > 0) ? 200 : 500
      json.results = results
      json.msg = (results.length > 0) ? 'Ok' : 'No se encontraron registros'
    }).catch( error => {
      json.result = 404
      json.msg = ctrlError(error, req.route.stack[0].method, req.route.path)
      json.results = error
    }).finally( () => {
      res.json(json)
    }) // aqlApi.query()

  }) // /api/cliente/:id


  // Cliente post
  app.post('/api/cliente/:id', mdi, async (req, res) => {
    let json = {}
    let qry
    let id

    try {
      id = (req.params.id ) ? req.params.id : 0
      qry = `
        SELECT id
        FROM clientes
        WHERE id = ${id}
      `
      results = await sqlApi.query(qry)
      if (results[0] && results[0].length == 0) {
        // El registro no existe
        qry = `
          INSERT INTO clientes (paterno, materno, nombre, nombreCompleto, email, telefono1, telefono2, domicilio, colonia, cp, pais, fecha)
          VALUES ('', '', '', '${req.body.nombreCompleto}', '${req.body.email}', '${req.body.telefono1}', '', '', '', '', '', , '${req.body.pais}', NEW())
        `
      } else {
        qry = `
          UPDATE clientes
          SET nombreCompleto = '${req.body.nombreCompleto}',
              email = '${req.body.email}',
              telefono1 = '${req.body.telefono1}',
              pais = '${req.body.pais}'
          WHERE id = ${req.body.id}
        `
      }

      sqlApi.query(qry)
      json.result = 200
      json.msg = "Registro guardado correctamente"

    } catch (error) {
      json.result = 404
      json.msg = ctrlError(error, req.route.stack[0].method, req.route.path)
      json.results = error

    }

  }) // /api/cliente/:id post

  // Graba Email y Teléfono
  app.put('/api/edita-varios/:id', mdi, (req, res) => {
    let json = {}
    let qry = `
      UPDATE polizas
      SET email = '${req.body.email}',
          telefono = '${req.body.telefono}',
          tipo = '${req.body.tipo}',
          modelo = '${req.body.modelo}',
          marca = '${req.body.marca}',
          descripcion = '${req.body.descripcion}',
          observaciones = '${req.body.observaciones}'
      WHERE id = ${req.params.id}
    `
    sqlApi.query(qry).then(([results]) => {
      json.result = 200
      json.results = []
      json.msg = "Ok"
    }).catch( error => {
      json.result = 404
      json.msg = ctrlError(error, req.route.stack[0].method, req.route.path)
      json.results = error
    }).finally( () => {
      res.json(json)
    }) // aqlApi.query()

  }) // /api/telEmail/:id


  // Borra un registro
  app.delete('/api/poliza/:id', mdi, (req, res) => {
    let json = {}
    let qry = `
      DELETE FROM polizas
      WHERE id = ${req.params.id}
    `
    sqlApi.query(qry).then(([results]) => {
      json.result = 200
      json.results = []
      json.msg = "Ok"
    }).catch( error => {
      json.result = 404
      json.msg = ctrlError(error, req.route.stack[0].method, req.route.path)
      json.results = error
    }).finally( () => {
      res.json(json)
    }) // aqlApi.query()

  }) // /api/poliza/:id

  // Nombres y teléfonos para CSV
  app.get('/api/csv/:orden', mdi, (req, res) => {
    let json = {}
    let qry

    if (req.params.orden == 'NOMBRE_TELEFONO') {
      qry = `
        SELECT nombreCompleto Nombre,
          CASE WHEN pais = 'mx'
                THEN CONCAT('+52', ' ', REGEXP_REPLACE(REPLACE(telefono1, '-', ''), '[(|)| ]', '' ) )
                ELSE CONCAT('+1', ' ', REGEXP_REPLACE(REPLACE(telefono1, '-', ''), '[(|)| ]', '') )
          END Telefono
        FROM clientes
        UNION
        SELECT asegurado Nombre, CONCAT('+1 ', REPLACE(telefono, '-', '')) Telefono
        FROM polizas
        ORDER BY TRIM(Nombre)
      `
    } else {
      qry = `
        SELECT
          CASE WHEN pais = 'mx'
                THEN CONCAT('+52', ' ', REGEXP_REPLACE(REPLACE(telefono1, '-', ''), '[(|)| ]', '' ) )
                ELSE CONCAT('+1', ' ', REGEXP_REPLACE(REPLACE(telefono1, '-', ''), '[(|)| ]', '') )
          END Telefono,
          nombreCompleto Nombre
        FROM clientes
        UNION
        SELECT CONCAT('+1 ', REPLACE(telefono, '-', '')) Telefono, asegurado Nombre
        FROM polizas
        ORDER BY TRIM(Nombre)
      `
    }
    sqlApi.query(qry).then(results => {
      json.response = 200
      json.msg = "Ok"
      json.data = results[0]
    }).catch(error => {
      json.response = 404
      json.msg = error.message
      json.data = []
    }).finally(() => {
      res.json(json)
    })
  }) // /api/csv/:orden

}) // export default
