const router = require('express').Router();
const ctrl   = require('../controllers/productos.controller');

router.get('/',                    ctrl.getAll);
router.get('/codigo/:codigo',      ctrl.getByCodigo);
router.get('/nombre/:nombre',      ctrl.getByNombre);
router.get('/categoria/:categoria',ctrl.getByCategoria);
router.post('/',                   ctrl.create);
router.put('/codigo/:codigo',      ctrl.updateByCodigo);
router.delete('/codigo/:codigo',   ctrl.deleteByCodigo);

module.exports = router;
