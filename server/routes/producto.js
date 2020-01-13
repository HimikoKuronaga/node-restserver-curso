const express = require('express');
const { verificaToken } = require('./../middlewares/autenticacion');
const app = express();
let Producto = require('./../models/producto');


//===========
//  Obtener productos
//===========
app.get('/producto', verificaToken, (req, res) => {
    /**
     * Trae todos los productos
     * populate: usuario categoria
     * Paginado
     */

    let limite = req.query.limite || 5;
    limite = Number(limite);
    let desde = req.query.desde || 0;
    desde = Number(desde);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            })
        });
});


//===========
//  Obtener un producto por id
//===========
app.get('/producto/:id', verificaToken, (req, res) => {
    /**
     * populate: usuario categoria
     * Paginado
     */

    let id = req.params.id;
    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'nombre')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'No existe ese id',
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB,
            })

        });
});

//===========
// Buscar productos
//===========
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {
    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {

            if (err) {
                res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            })
        });
});

//===========
//  Crear un producto
//===========
app.post('/producto', verificaToken, (req, res) => {
    /**
     * Grabar el usuario 
     * Grabar una categoria del listado
     */

    let body = req.body;
    let producto = new Producto({
        usuario: req.usuario._id,
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            producto: productoDB,
        });
    })
});

//===========
// Actualiza un producto
//===========
app.put('/producto/:id', verificaToken, (req, res) => {
    //Grabas el usuario 
    //Grabasr una categoria del listado

    let id = req.params.id;
    let body = req.body;

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        }

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.categoria = body.categoria;
        productoDB.disponible = body.disponible;
        productoDB.descripcion = body.descripcion;

        productoDB.save((err, productoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                producto: productoGuardado
            })
        });

    });
});

//===========
// Borrar un producto
//===========
app.delete('/producto/:id', verificaToken, (req, res) => {
    /**
     * Disponible -> falso
     */
    let id = req.params.id;
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'ID no encontrado'
                }
            });
        }

        productoDB.disponible = false;
        productoDB.save((err, productoBorrado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productoBorrado,
                message: 'Producto borrado'
            })
        });
    });

});

module.exports = app;