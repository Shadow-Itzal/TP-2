const router = require('express').Router();
const ctrl   = require('../controllers/productos.controller');  //

router.get('/',                    ctrl.getAll);  // obtiene todos los productos
router.get('/codigo/:codigo',      ctrl.getByCodigo);  // obtiene un producto por codigo
router.get('/nombre/:nombre',      ctrl.getByNombre);  // obtiene un producto por nombre
router.get('/categoria/:categoria',ctrl.getByCategoria);  // obtiene un producto por categoria
router.post('/',                   ctrl.create);  // crea un producto
router.put('/codigo/:codigo',      ctrl.updateByCodigo);  // actualiza un producto
router.delete('/codigo/:codigo',   ctrl.deleteByCodigo);  // elimina un producto

module.exports = router;  // exporta el router
