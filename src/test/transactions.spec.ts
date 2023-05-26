import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../app'
import { execSync } from 'node:child_process'

// testando toda minha roda de transação
describe('Transactions routes', () => {
  // esperando minha aplicação ser executada antes de fazer o teste
  beforeAll(async () => {
    await app.ready()
    // aguardando meu app ficar pronto
  })

  // após a aplicação ser executada, fechar a aplicação. Removendo aplicação da memoria
  afterAll(async () => {
    await app.close()
  })
  // antes de cada um dos testes
  beforeEach(() => {
    execSync('npx knex migrate:rollback --all') // apaga um banco
    execSync('npx knex migrate:latest') // cria de novo
  })

  // [x] deve ser possivel criar uma nova transação
  it('should be able to create a new transaction', async () => {
    // fazer a chamada HTTP p/ criar uma nova transação
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'New Transaction',
        amount: 8000,
        type: 'credit',
      })
      .expect(201) // validação
  })

  // [x] deve ser possivel lista todas as minhas transações
  it('should be able to list all transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New Transaction',
        amount: 8000,
        type: 'credit',
      })
    const cookie = createTransactionResponse.get('Set-Cookie')
    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookie)
      .expect(200)
    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'New Transaction',
        amount: 8000,
      }),
    ])
  })

  // [x] deve ser possivel lista somente uma transação especifica
  it('should be able to get a specific transaction', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New Transaction',
        amount: 8000,
        type: 'credit',
      })
    const cookie = createTransactionResponse.get('Set-Cookie')

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookie)
      .expect(200)

    const transactionId = listTransactionsResponse.body.transactions[0].id

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookie)
      .expect(200)
    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: 'New Transaction',
        amount: 8000,
      }),
    )
  })

  // [x] deve ser possivel lista o resumo
  it('should be able to get the summay', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Credit Transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookie = createTransactionResponse.get('Set-Cookie')

    await request(app.server).post('/transactions').set('Cookie', cookie).send({
      title: 'Debiy Transaction',
      amount: 2000,
      type: 'debit',
    })
    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookie)
      .expect(200)

    expect(summaryResponse.body.summary).toEqual({
      amount: 3000,
    })
  })
})
