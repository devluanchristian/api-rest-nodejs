import fastify from 'fastify'
import { knex } from './database'
import { randomUUID } from 'crypto'

const app = fastify()

app.get('/hello', async () => {
  // inserindo dados na tabela transactions
  // const transaction = await knex('transactions')
  //   .insert({
  //     id: randomUUID(),
  //     title: 'Testando api 1',
  //     amount: 1000,
  //   })
  //   .returning('*')
  // return transaction
  // ---------------------------------------------
  // buscando os dados que foram inseridos
  // const transactions = await knex('transactions').select('*')
  // return transactions
  // ---------------------------------------------
  // buscando somente um dado que foi inserido
  // const transaction = await knex('transactions')
  //   .where('amount', 1000)
  //   .select('*')
  // return transaction
})

app
  .listen({
    port: 3333,
  })

  .then(() => {
    console.log('listening on port')
  })
