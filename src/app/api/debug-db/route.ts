import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { topics } from '@/lib/schema';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Test raw SQL query first
    const rawResult = await db.execute(sql`SELECT 1 as test`);
    console.log('Raw SQL test:', rawResult);

    // Test Drizzle ORM query
    const drizzleResult = await db.select().from(topics).limit(1);
    console.log('Drizzle ORM test:', drizzleResult);

    // Test schema info
    const schemaResult = await db.execute(sql`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'meraki' AND table_name = 'topic'
    `);
    console.log('Schema info:', schemaResult);

    return NextResponse.json({
      status: 'Database connection successful',
      rawTest: rawResult,
      drizzleTest: drizzleResult,
      schemaInfo: schemaResult.rows
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      error: 'Database test failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
