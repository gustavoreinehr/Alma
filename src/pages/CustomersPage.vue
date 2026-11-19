<template>
  <div class="page">
    <header class="page-head">
      <h1 class="page-title">Clientes</h1>
      <p class="page-sub">Pessoas que fazem parte da alma.</p>
    </header>
    <div class="orders-toolbar">
      <input
        v-model="busca"
        class="orders-search"
        placeholder="Buscar por cliente"
        aria-label="Buscar por cliente"
      />
      <button class="btn-primary orders-new" @click="novo">Novo</button>
    </div>
    <form v-if="mostrarFormulario" class="card form-card" @submit.prevent="salvarCliente">
      <h2 class="section-title">{{ editando ? 'Editar cliente' : 'Novo cliente' }}</h2>
      <div class="form-grid">
        <label class="field"
          >Nome<input v-model="formulario.nome" maxlength="100" required
        /></label>
        <label class="field"
          >E-mail<input v-model="formulario.email" type="email" maxlength="150"
        /></label>
        <label class="field"
          >Telefone<input v-model="formulario.telefone" type="tel" maxlength="20"
        /></label>
      </div>
      <div class="form-actions">
        <button class="btn-primary" :disabled="salvando">Salvar</button
        ><button type="button" class="btn-secondary" @click="mostrarFormulario = false">
          Cancelar
        </button>
      </div>
    </form>
    <p v-if="erro" class="feedback-error" role="alert">{{ erro }}</p>
    <div class="card table-card">
      <div class="table-card-head">
        <span class="section-title">Todos os clientes</span
        ><span class="table-count">{{ filtrarClientes().length }} registros</span>
      </div>
      <table class="orders-table" aria-label="Lista de clientes">
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Telefone</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cliente in filtrarClientes()" :key="cliente.id">
            <td>{{ cliente.nome }}</td>
            <td>{{ cliente.email || '—' }}</td>
            <td>{{ cliente.telefone || '—' }}</td>
            <td>
              <button class="btn-link" @click="editar(cliente)">Editar</button
              ><button class="btn-link" @click="excluirCliente(cliente)">Excluir</button>
            </td>
          </tr>
          <tr v-if="!carregando && filtrarClientes().length === 0">
            <td colspan="4" class="orders-empty">Nenhum cliente encontrado.</td>
          </tr>
        </tbody>
      </table>
      <p v-if="carregando" class="loading">Carregando clientes...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { listar, salvar, excluir } from '../services/loja'

const clientes = ref([])
const busca = ref('')
const formulario = ref({ nome: '', email: '', telefone: '' })
const editando = ref(null)
const mostrarFormulario = ref(false)
const carregando = ref(false)
const salvando = ref(false)
const erro = ref('')

function filtrarClientes() {
  return clientes.value.filter((cliente) =>
    cliente.nome.toLowerCase().includes(busca.value.trim().toLowerCase()),
  )
}
function novo() {
  formulario.value = { nome: '', email: '', telefone: '' }
  editando.value = null
  erro.value = ''
  mostrarFormulario.value = true
}
function editar(cliente) {
  formulario.value = {
    nome: cliente.nome,
    email: cliente.email || '',
    telefone: cliente.telefone || '',
  }
  editando.value = cliente.id
  erro.value = ''
  mostrarFormulario.value = true
}
async function carregar() {
  carregando.value = true
  try {
    clientes.value = await listar('/clientes')
  } catch (e) {
    erro.value = e.response?.data?.message || 'Não foi possível carregar clientes.'
  } finally {
    carregando.value = false
  }
}
async function salvarCliente() {
  salvando.value = true
  erro.value = ''
  try {
    await salvar('/clientes', formulario.value, editando.value)
    mostrarFormulario.value = false
    await carregar()
  } catch (e) {
    erro.value = e.response?.data?.message || 'Não foi possível salvar cliente.'
  } finally {
    salvando.value = false
  }
}
async function excluirCliente(cliente) {
  if (!confirm(`Excluir cliente "${cliente.nome}"?`)) return
  erro.value = ''
  try {
    await excluir('/clientes', cliente.id)
    await carregar()
  } catch (e) {
    erro.value = e.response?.data?.message || 'Não foi possível excluir cliente.'
  }
}
onMounted(carregar)
</script>
