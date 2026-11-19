<template>
  <LoginPage v-if="pagina === 'login'" @entrar="aoEntrar" />

  <div v-else>
    <header class="app-header">
      <div class="app-toolbar">
        <span class="brand">alma.</span>
        <nav class="app-nav" aria-label="Navegação principal">
          <button
            class="nav-link"
            :class="{ 'is-active': pagina === 'inicio' }"
            @click="pagina = 'inicio'"
          >
            Visão geral
          </button>
          <button
            class="nav-link"
            :class="{ 'is-active': pagina === 'pedidos' }"
            @click="pagina = 'pedidos'"
          >
            Pedidos
          </button>
          <button
            class="nav-link"
            :class="{ 'is-active': pagina === 'produtos' }"
            @click="pagina = 'produtos'"
          >
            Produtos
          </button>
          <button
            class="nav-link"
            :class="{ 'is-active': pagina === 'clientes' }"
            @click="pagina = 'clientes'"
          >
            Clientes
          </button>
        </nav>
        <div class="app-user">
          <span class="user-avatar">{{ usuario.nome.charAt(0).toUpperCase() }}</span>
          <div>
            <span class="user-name">{{ usuario.nome }}</span
            ><span class="user-role">Usuário</span>
          </div>
        </div>
        <button class="logout" @click="aoSair">Sair</button>
      </div>
    </header>

    <main>
      <DashboardPage v-if="pagina === 'inicio'" />
      <OrdersPage v-if="pagina === 'pedidos'" />
      <ProductsPage v-if="pagina === 'produtos'" />
      <CustomersPage v-if="pagina === 'clientes'" />
    </main>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { usuarioAtual, sair } from './services/usuarios'
import LoginPage from './pages/LoginPage.vue'
import DashboardPage from './pages/DashboardPage.vue'
import OrdersPage from './pages/OrdersPage.vue'
import ProductsPage from './pages/ProductsPage.vue'
import CustomersPage from './pages/CustomersPage.vue'

const pagina = ref('login')
const usuario = ref({ nome: '' })

function aoEntrar(dados) {
  usuario.value = dados
  pagina.value = 'inicio'
}

function aoSair() {
  sair()
  usuario.value = { nome: '' }
  pagina.value = 'login'
}

onMounted(async () => {
  window.addEventListener('sessao-expirada', aoSair)
  if (localStorage.getItem('api-token')) {
    try {
      aoEntrar(await usuarioAtual())
    } catch (error) {
      if (error.response?.status === 401) {
        aoSair()
      }
    }
  }
})
onUnmounted(() => {
  window.removeEventListener('sessao-expirada', aoSair)
})
</script>
