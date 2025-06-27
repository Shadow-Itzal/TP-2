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
// Función para validar un producto
const camposPermitidos = {
  codigo:    (v) => Number.isInteger(v),  // codigo tiene que ser un entero
  nombre:    (v) => typeof v === 'string' && v.trim().length > 0,  // nombre tiene que ser una cadena de texto y no estar vacía
  precio:    (v) => typeof v === 'number' && v >= 0,  // precio tiene que ser un número y ser mayor o igual a 0
  categoria: (v) => typeof v === 'string' && v.trim().length > 0,  // categoria tiene que ser una cadena de texto y no estar vacía
};


// Función para validar un producto
function validarProducto(producto) {  // valida un producto
  for (const key of Object.keys(camposPermitidos)) {  // recorre los campos permitidos
    if (!producto.hasOwnProperty(key) || !camposPermitidos[key](producto[key])) {  // si el producto no tiene el campo o el campo no cumple la validación
      return { valido: false, campo: key };  // devuelve el campo inválido
    }
  }
  return { valido: true };  // devuelve el producto validado
}


// Función para extraer las actualizaciones de un producto
function extraerActualizaciones(body) {  // extrae las actualizaciones de un producto
  const updates = {};  // objeto para las actualizaciones
  for (const key of Object.keys(camposPermitidos)) {  // recorre los campos permitidos
    if (body.hasOwnProperty(key) && key !== 'codigo') {  // si el producto tiene el campo
      if (!camposPermitidos[key](body[key])) {  // si el campo no cumple la validación
        return { error: `Campo "${key}" inválido` };  // devuelve el error
      }
      updates[key] = body[key];  // agrega el campo a las actualizaciones
    }
  }
  return { actualizaciones: updates };  // devuelve las actualizaciones
}


// Controladores para obtener todos los productos
exports.getAll = async (req, res) => {  // obtiene todos los productos
  try {
    const productos = await getProductos();  // obtiene los productos
    res.json(productos);   // devuelve los productos
  } catch (err) {  // si hay un error
    console.error(err);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};


// Controladores para obtener un producto
exports.getByCodigo = async (req, res) => {  // obtiene un producto
  const codigo = parseInt(req.params.codigo, 10);  // obtiene el codigo y lo convierte a entero
  if (!Number.isInteger(codigo)) return res.status(400).json({ mensaje: 'Código inválido' });  // si el codigo no es un entero, devuelve un error

  try {  // busca un producto
    const producto = await getProductoByCodigo(codigo);  // busca un producto por su codigo
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });  // si no se encuentra el producto, devuelve un error
    res.json(producto);  // devuelve el producto
  } catch (err) {  // si hay un error
    console.error(err);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};


// Controladores para obtener productos por nombre
exports.getByNombre = async (req, res) => {  // obtiene productos por nombre
  const nombre = req.params.nombre.trim();  // obtiene el nombre
  if (!nombre) return res.status(400).json({ mensaje: 'Nombre inválido' });  // si el nombre es vacio, devuelve un error

  try {
    const producto = await getProductoByNombre(nombre);  // busca un producto por su nombre
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });  // si no se encuentra el producto, devuelve un error
    res.json(producto);  // devuelve el producto
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};


// Controladores para obtener productos por categoría
exports.getByCategoria = async (req, res) => {  // obtiene productos por categoría
  const categoria = req.params.categoria.trim();  // obtiene la categoría
  if (!categoria) return res.status(400).json({ mensaje: 'Categoría inválida' });  // si la categoría es vacia, devuelve un error

  try { // busca productos por categoría
    const productos = await getProductosByCategoria(categoria);
    if (productos.length === 0) return res.status(404).json({ mensaje: 'Sin resultados' });
    res.json(productos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};


// Controladores para crear un producto
exports.create = async (req, res) => {  // crea un producto
  const producto = req.body;  // obtiene el producto
  const { valido, campo } = validarProducto(producto);  // valida el producto
  if (!valido) return res.status(400).json({ mensaje: `Campo "${campo}" inválido o faltante` });  // si el producto no es valido, devuelve un error

  try {
    const id = await createProducto(producto);  // crea el producto
    res.status(201).json({ mensaje: 'Producto creado', id });  // devuelve el producto creado
  } catch (err) {  // si hay un error
    console.error(err);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};


// Controladores para actualizar un producto
exports.updateByCodigo = async (req, res) => {  // actualiza un producto por codigo
  const codigo = parseInt(req.params.codigo, 10);  // obtiene el codigo
  if (!Number.isInteger(codigo)) return res.status(400).json({ mensaje: 'Código inválido' });  // si el codigo no es un entero, devuelve un error

  const { actualizaciones, error } = extraerActualizaciones(req.body);  // extrae las actualizaciones
  if (error) return res.status(400).json({ mensaje: error });  // si hay un error
  if (Object.keys(actualizaciones).length === 0) return res.status(400).json({ mensaje: 'No se proporcionaron campos para actualizar' });  // si no se proporcionaron campos para actualizar, devuelve un error

  try {
    const count = await updateProducto(codigo, actualizaciones);  // actualiza el producto
    if (count === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });  // si no se encuentra el producto, devuelve un error
    const updated = await getProductoByCodigo(codigo);  // busca el producto actualizado
    res.json(updated);  // devuelve el producto actualizado
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};


// Controladores para eliminar un producto por codigo
exports.deleteByCodigo = async (req, res) => {  // elimina un producto
  const codigo = parseInt(req.params.codigo, 10);  // obtiene el codigo y lo convierte a entero
  if (!Number.isInteger(codigo)) return res.status(400).json({ mensaje: 'Código inválido' });  // si el codigo no es un entero, devuelve un error

  try {
    const count = await deleteProducto(codigo);  // elimina el producto
    if (count === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });  // si no se encuentra el producto, devuelve un error
    res.json({ mensaje: 'Producto eliminado' });  // devuelve el producto eliminado
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};
