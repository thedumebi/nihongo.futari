/* eslint-disable no-console */
import { Client } from 'pg'

import env from '@/env.js'

async function createDatabaseIfNotExists() {
  if (env.NODE_ENV === 'production') {
    console.error('❌ Cannot create database in production environment')
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
      console.log(`📦 Creating database "${env.PG_DATABASE}"...`)
      await client.query(`CREATE DATABASE "${env.PG_DATABASE}"`)
      console.log(`📦 Done "${env.PG_DATABASE}"`)
    } else {
      console.log(`✅ Database "${env.PG_DATABASE}" already exists.`)
      // In test, recreate from scratch for a clean slate.
      if (env.NODE_ENV === 'test') {
        await client.query(`DROP DATABASE "${env.PG_DATABASE}"`)
        await client.query(`CREATE DATABASE "${env.PG_DATABASE}"`)
      }
    }
  } catch (err) {
    console.error('❌ Error checking/creating database:', err)
    process.exit(1)
  } finally {
    await client.end()
  }
}

createDatabaseIfNotExists().catch((err) => {
  console.error('❌ Failed to create database:', err)
  process.exit(1)
})
