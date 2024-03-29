import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { checkSessionIdExist } from '../middlewares/check-session-id-exists'

// Cookies <--> Formas dagente manter contexto entre requisições

// plugin
export async function transactionsRoutes(app: FastifyInstance) {
  // busca transações
  app.get('/', { preHandler: checkSessionIdExist }, async (request) => {
    const { sessionId } = request.cookies
    const transactions = await knex('transactions')
      .select('*')
      .where('session_id', sessionId)
    return { transactions }
  })
  // busca somente uma transação
  app.get('/:id', { preHandler: checkSessionIdExist }, async (request) => {
    const getTransactionsParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getTransactionsParamsSchema.parse(request.params)
    const { sessionId } = request.cookies
    const transaction = await knex('transactions')
      .select()
      .where({
        session_id: sessionId,
        id,
      })
      .first()
    return { transaction }
  })

  app.get('/summary', { preHandler: checkSessionIdExist }, async (request) => {
    const { sessionId } = request.cookies
    const summary = await knex('transactions')
      .sum('amount', { as: 'amount' })
      .where('session_id', sessionId)
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
