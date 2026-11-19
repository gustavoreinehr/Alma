import { api } from '../boot/axios'

async function login(login, senha) {
  const resposta = await api.post('/auth/login', { login, senha })
  localStorage.setItem('api-token', resposta.data.data.token)
  return resposta.data.data
}

async function usuarioAtual() {
  const resposta = await api.get('/auth/me')
  return resposta.data.data
}

function sair() {
  localStorage.removeItem('api-token')
}

export { login, usuarioAtual, sair }
