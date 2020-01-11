
//===============
// PUERTO
//===============
process.env.PORT = process.env.PORT || 3000;


//===============
// ENTORNO
//===============
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//===============
// Vencimiento del Token
//===============
// 60segundos x 60 minutos x 24horas x 30 días
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

//===============
// SEED de autentificacion
//===============
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';

//===============
// Base de datos
//===============
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;

//===============
// Google Client ID
//===============

process.env.CLIENT_ID = process.env.CLIENT_ID || '70347058938-ce3srk7om7lpbktmldbjh6af56a84eom.apps.googleusercontent.com';