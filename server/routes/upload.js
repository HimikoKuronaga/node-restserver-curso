const express = require('express');
const fileupload = require('express-fileupload');
const app = express();

const Usuario = require('./../models/usuario');
const Producto = require('./../models/producto');

const fs = require('fs');
const path = require('path');

//default options
app.use(fileupload({ useTempFiles: true }));


app.post('/upload/:tipo/:id', (req, res) => {
    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado un archivo'
            }
        });
    }

    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitidas son: ' + tiposValidos.join(', '),
            }
        });
    }


    let archivo = req.files.archivo;

    /** Extensiones permitidas */
    let extencionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];

    if (extencionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extenciones permitidas son: ' + extencionesValidas.join(', '),
                ext: extension
            }
        });
    }

    /** Se cambia el nombre del archivo */
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`

    archivo.mv(`./uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        /**Aqui imagen guardada*/
        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }
    });

});

function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El usuario no existe'
                }
            });
        }

        borraArchivo(usuarioDB.img, 'usuarios');

        usuarioDB.img = nombreArchivo;
        usuarioDB.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            })
        });
    });
}

function imagenProducto(id, res, nombreArchivo) {
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borraArchivo(nombreArchivo , 'productos');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            });
        }

        borraArchivo(productoDB.img, 'productos');

        productoDB.img = nombreArchivo;
        productoDB.save((err, productoGuardado) => {
            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            })
        });
    });
}

function borraArchivo(nombreImagen, tipo) {
    let pathImagen = path.resolve(__dirname, `./../../uploads/${tipo}/${nombreImagen}`);

    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    } else {

    }
}


module.exports = app;