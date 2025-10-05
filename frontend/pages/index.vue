<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
    <div class="text-center p-8">
      <h1 class="text-5xl font-bold text-gray-900 dark:text-white mb-4">
        🐾 Cat Adoption Platform
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mb-8 text-xl">
        Find your purrfect companion
      </p>
      <NuxtLink 
        to="/forum/main" 
        class="inline-block bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
      >
        Go to Forum →
      </NuxtLink>
    </div>
  </div>
</template>