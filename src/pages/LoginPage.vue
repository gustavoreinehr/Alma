<template>
  <div class="login-page">
    <header class="login-header">
      <div class="login-brand-group">
        <span class="brand">alma.</span>
      </div>
    </header>
    <main class="login-main">
      <div class="login-box">
        <p class="eyebrow">Acesso do vendedor</p>
        <h1 class="page-title">Bom ter você aqui.</h1>
        <p class="page-sub">Entre com seu usuário e senha para acessar a loja.</p>
        <form class="login-form" @submit.prevent="entrar">
          <label class="field"
            >Usuário<input v-model="usuario" autocomplete="username" placeholder="admin"
          /></label>
          <label class="field"
            >Senha<input
              v-model="senha"
              type="password"
              autocomplete="current-password"
              placeholder="Sua senha"
          /></label>
          <p v-if="erro" class="login-error" role="alert">{{ erro }}</p>
          <button class="btn-primary" type="submit">Entrar</button>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { login } from '../services/usuarios'

const emit = defineEmits(['entrar'])
const usuario = ref('')
const senha = ref('')
const erro = ref('')

async function entrar() {
  erro.value = ''
  try {
    const dados = await login(usuario.value.trim(), senha.value)
    emit('entrar', dados)
  } catch (error) {
    erro.value = error.response?.data?.message || 'Não foi possível conectar à API.'
  }
}
</script>
