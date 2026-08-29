import { createRouter } from '@/lib/create-app.js'

const router = createRouter()

router.get('/', (c) => {
  return c.json({
    name: 'nihongo',
    version: '0.1.0',
    docs: '/reference'
  })
})

export default router
