import fastify from 'fastify'
import { env } from './env'
import {
  getTransactionsRoutes,
  transactionsRoutes,
} from './routes/transactions'

const app = fastify()

app.register(transactionsRoutes, {
  prefix: 'transactions',
})
app.register(getTransactionsRoutes, {
  prefix: 'transactions',
})

app
  .listen({
    port: env.PORT,
  })

  .then(() => {
    console.log('listening on port')
  })
