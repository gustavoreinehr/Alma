const controller = require('../controllers/usuarios')
const { verifyUser } = require('../middlewares/auth')

module.exports = (app) => {
  app.post('/auth/register', controller.register)
  app.post('/auth/login', controller.login)
  app.get('/auth/me', verifyUser, controller.usuarioAtual)
}
