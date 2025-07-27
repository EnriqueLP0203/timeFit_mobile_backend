import {Router} from 'express'
import {login, register, logout, profile} from '../controllers/userController.js'
import { authRequired } from '../middlewares/validateToken.js';
 
const router = Router()

//registrar usuario
router.post('/register', register)

//iniciar sesion
router.post('/login', login)

//cerrar sesion
router.post('/logout', logout)

//obtener datos del usuario
router.get('/profile', authRequired, profile)

export default router;