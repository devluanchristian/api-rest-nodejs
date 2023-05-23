import { knex as setuKnex } from 'knex'

export const knex = setuKnex({
  client: 'sqlite',
  connection: {
    filename: './tmp/app.db',
  },
  useNullAsDefault: true,
})
