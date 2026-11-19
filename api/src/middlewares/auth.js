const jwt = require('jsonwebtoken')

function verifyUser(req, res, next) {
  const header = req.headers.authorization || ''
  const [prefixo, token, extra] = header.split(' ')
  if (prefixo !== 'Bearer' || !token || extra) {
    return res.status(401).json({ status: 'error', message: 'Token não informado.' })
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] })
    next()
  } catch {
    return res.status(401).json({ status: 'error', message: 'Token inválido ou expirado.' })
  }
}

module.exports = { verifyUser }
