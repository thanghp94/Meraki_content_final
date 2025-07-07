import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const programFilter = searchParams.get('program');
    const unitFilter = searchParams.get('unit');

    // For Grapeseed with lazy loading
    if (programFilter === 'Grapeseed') {
      if (!unitFilter) {
        // Return empty placeholders for all 40 units (instant response)
        const allUnits = [];
        for (let i = 1; i <= 40; i++) {
          allUnits.push({
            unit: `Unit ${i}`,
            topics: []
          });
        }
        return NextResponse.json(allUnits);
      }
      
      // Fetch topics for specific unit only (single query)
      const unitTopics = await db.execute(sql`
        SELECT 
          id,
          topic,
          short_summary,
          image
        FROM topic
        WHERE unit = ${unitFilter} AND program = 'Grapeseed'
        ORDER BY COALESCE(order_index, 999999), topic
      `);

      return NextResponse.json([{
        unit: unitFilter,
        topics: unitTopics.rows || []
      }]);
    }

    // For TATH with lazy loading
    if (programFilter === 'TATH') {
      if (!unitFilter) {
        // Return empty placeholders for all 12 units (instant response)
        const allUnits = [];
        for (let i = 1; i <= 12; i++) {
          allUnits.push({
            unit: `Bài ${i}`,
            topics: []
          });
        }
        return NextResponse.json(allUnits);
      }
      
      // Fetch topics for specific unit only (single query)
      const unitTopics = await db.execute(sql`
        SELECT 
          id,
          topic,
          short_summary,
          image
        FROM topic
        WHERE unit = ${unitFilter} AND program = 'TATH'
        ORDER BY COALESCE(order_index, 999999), topic
      `);

      return NextResponse.json([{
        unit: unitFilter,
        topics: unitTopics.rows || []
      }]);
    }

    // For other programs or no filter, use the original query
    let whereClause = 'WHERE visible IS NOT FALSE';
    if (programFilter) {
      whereClause += ` AND program = '${programFilter}'`;
    }

    const result = await db.execute<{
      unit: string;
      topics: {
        id: string;
        topic: string;
        short_summary: string;
        image: string;
      }[];
    }>(sql`
      SELECT 
        COALESCE(unit, 'Uncategorized') as unit,
        json_agg(
          json_build_object(
            'id', id,
            'topic', topic,
            'short_summary', short_summary,
            'image', image
          ) ORDER BY COALESCE(order_index, 999999), topic
        ) as topics
      FROM topic
      ${sql.raw(whereClause)}
      GROUP BY unit
      ORDER BY 
        CASE 
          WHEN unit IS NULL THEN 2
          ELSE 1
        END,
        unit
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching topics by unit:', error);
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
  }
}
