import {Router} from 'express'
import { authRequired } from '../middlewares/validateToken.js';
import { createMembership, getAllMemberships, getMembershipById, updateMembership, deleteMembership } from '../controllers/membershipController.js';

const router = Router();

//crear membresia
router.post('/crear', authRequired, createMembership)


//Obtener todas las membresias
router.get('/obtener', authRequired, getAllMemberships)

//Obtener membresia por ID
router.get('/:id', authRequired, getMembershipById)


//actualizar membreisa
router.put('/:id', authRequired, updateMembership)

//eliminar membreisa
router.delete('/:id', authRequired, deleteMembership)

export default router;