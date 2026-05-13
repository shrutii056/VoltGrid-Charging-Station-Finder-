<template>
  <!-- RegisterView just redirects to /login; the login page has a register tab -->
  <div></div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
router.replace('/login')
</script>
