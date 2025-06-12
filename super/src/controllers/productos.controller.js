// src/controllers/productos.controller.js
const {
  createProducto,
  getProductos,
  getProductoByCodigo,
  getProductoByNombre,
  getProductosByCategoria,
  updateProducto,
  deleteProducto
} = require('../config/mongodb');

// Campos permitidos y validadores
const camposPermitidos = {
  codigo:    (v) => Number.isInteger(v),
  nombre:    (v) => typeof v === 'string' && v.trim().length > 0,
  precio:    (v) => typeof v === 'number' && v >= 0,
  categoria: (v) => typeof v === 'string' && v.trim().length > 0,
};

function validarProducto(producto) {
  for (const key of Object.keys(camposPermitidos)) {
    if (!producto.hasOwnProperty(key) || !camposPermitidos[key](producto[key])) {
      return { valido: false, campo: key };
    }
  }
  return { valido: true };
}

function extraerActualizaciones(body) {
  const updates = {};
  for (const key of Object.keys(camposPermitidos)) {
    if (body.hasOwnProperty(key) && key !== 'codigo') {
      if (!camposPermitidos[key](body[key])) {
        return { error: `Campo "${key}" inválido` };
      }
      updates[key] = body[key];
    }
  }
  return { actualizaciones: updates };
}

exports.getAll = async (req, res) => {
  try {
    const productos = await getProductos();
    res.json(productos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

exports.getByCodigo = async (req, res) => {
  const codigo = parseInt(req.params.codigo, 10);
  if (!Number.isInteger(codigo)) return res.status(400).json({ mensaje: 'Código inválido' });

  try {
    const producto = await getProductoByCodigo(codigo);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(producto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

exports.getByNombre = async (req, res) => {
  const nombre = req.params.nombre.trim();
  if (!nombre) return res.status(400).json({ mensaje: 'Nombre inválido' });

  try {
    const producto = await getProductoByNombre(nombre);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(producto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

exports.getByCategoria = async (req, res) => {
  const categoria = req.params.categoria.trim();
  if (!categoria) return res.status(400).json({ mensaje: 'Categoría inválida' });

  try {
    const productos = await getProductosByCategoria(categoria);
    if (productos.length === 0) return res.status(404).json({ mensaje: 'Sin resultados' });
    res.json(productos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

exports.create = async (req, res) => {
  const producto = req.body;
  const { valido, campo } = validarProducto(producto);
  if (!valido) return res.status(400).json({ mensaje: `Campo "${campo}" inválido o faltante` });

  try {
    const id = await createProducto(producto);
    res.status(201).json({ mensaje: 'Producto creado', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

exports.updateByCodigo = async (req, res) => {
  const codigo = parseInt(req.params.codigo, 10);
  if (!Number.isInteger(codigo)) return res.status(400).json({ mensaje: 'Código inválido' });

  const { actualizaciones, error } = extraerActualizaciones(req.body);
  if (error) return res.status(400).json({ mensaje: error });
  if (Object.keys(actualizaciones).length === 0) return res.status(400).json({ mensaje: 'No se proporcionaron campos para actualizar' });

  try {
    const count = await updateProducto(codigo, actualizaciones);
    if (count === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    const updated = await getProductoByCodigo(codigo);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

exports.deleteByCodigo = async (req, res) => {
  const codigo = parseInt(req.params.codigo, 10);
  if (!Number.isInteger(codigo)) return res.status(400).json({ mensaje: 'Código inválido' });

  try {
    const count = await deleteProducto(codigo);
    if (count === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json({ mensaje: 'Producto eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};
