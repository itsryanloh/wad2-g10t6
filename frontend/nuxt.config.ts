export default defineNuxtConfig({
  compatibilityDate: '2025-10-05',
  devtools: { enabled: true },
  modules: [
    '@nuxt/image',
    '@nuxt/ui' 
  ],
  pages: true,
  
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
    }
  }
})