import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'

// Cookies <--> Formas dagente manter contexto entre requisições

// plugin
export async function transactionsRoutes(app: FastifyInstance) {
  // busca transações
  app.get('/', async () => {
    const transactions = await knex('transactions').select('*')
    return { transactions }
  })
  // busca somente uma transação
  app.get('/:id', async (request) => {
    const getTransactionsParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getTransactionsParamsSchema.parse(request.params)
    const transactions = await knex('transactions')
      .select()
      .where('id', id)
      .first()
    return { transactions }
  })

  app.get('/summary', async () => {
    const summary = await knex('transactions')
      .sum('amount', { as: 'amount' })
      .first()
    return { summary }
  })

  // cria uma transação
  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })
    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    )
    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()
      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
      })
    }

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })
    return reply.status(201).send()
  })
}
