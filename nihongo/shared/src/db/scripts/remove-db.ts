/* eslint-disable no-console */
import { Client } from 'pg'

import env from '@/env.js'

async function dropDatabase() {
  if (env.NODE_ENV === 'production') {
    console.error('❌ Cannot drop database in production environment')
    process.exit(1)
  }

  const client = new Client({
    user: env.PG_USERNAME,
    host: env.PG_HOST,
    database: 'postgres',
    password: env.PG_PASSWORD,
    port: env.PG_PORT
  })

  try {
    await client.connect()

    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [env.PG_DATABASE]
    )

    if (res.rowCount === 0) {
      console.log(`📦 No database "${env.PG_DATABASE}" to drop.`)
    } else {
      console.log(`🗑️  Dropping database "${env.PG_DATABASE}"...`)
      await client.query(`DROP DATABASE "${env.PG_DATABASE}"`)
      console.log(`🗑️  Dropped "${env.PG_DATABASE}"`)
    }
  } catch (err) {
    console.error('❌ Error dropping database:', err)
    process.exit(1)
  } finally {
    await client.end()
  }
}

dropDatabase().catch((err) => {
  console.error('❌ Failed to drop database:', err)
  process.exit(1)
})
