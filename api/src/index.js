require('dotenv').config()
const express = require('express')
const cors = require('cors')
const routes = require('./routers')

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'troque_por_uma_chave_grande_e_unica') {
  throw new Error('Configure JWT_SECRET no arquivo api/.env.')
}

const app = express()
app.use(cors())
app.use(express.json())
routes(app)

const porta = Number(process.env.PORT) || 3000
app.listen(porta, () => console.log(`API Alma rodando na porta ${porta}`))
