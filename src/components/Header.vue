<template>
  <header class="site-header">
    <div class="top-menu">
      <div class="brand-row">
        <div class="brand-inner">
          <router-link to="/" class="brand">91XS</router-link>
        </div>
      </div>

      <nav
        v-for="row in menu.rows"
        :key="row.title"
        class="menu-row"
        :class="`menu-${row.type}`"
        :aria-label="row.title"
      >
        <router-link class="group-title" :to="row.to">{{ row.title }}</router-link>
        <router-link
          v-for="item in row.items"
          :key="item.id"
          class="menu-item"
          :to="itemLink(row, item)"
        >{{ item.name }}</router-link>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import menu from '../config/menu.json'

const router = useRouter()

function itemLink(row, item) {
  if (row.type === 'image') return `/image?tid=${item.id}`
  if (row.type === 'novel') return `/novel?tid=${item.id}`
  return `/category/${item.id}`
}

function goSearch(keyword) {
  const value = String(keyword || '').trim()
  if (value) router.push({ path: '/search', query: { wd: value } })
}
</script>
