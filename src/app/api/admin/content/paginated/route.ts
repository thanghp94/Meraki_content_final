import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const topicIds = searchParams.get('topicIds');
    const program = searchParams.get('program');
    const unit = searchParams.get('unit');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build dynamic query based on filters
    let query = `
      SELECT 
        c.id,
        c."Title" as title,
        c.infor1,
        c.infor2,
        c.image1,
        c.image2,
        c.video1,
        c.video2,
        c.topicid,
        c.date_created,
        c.visible,
        c.order_index,
        t.topic as topic_name,
        t.unit as topic_unit
      FROM meraki.content c
      LEFT JOIN meraki.topic t ON t.id = c.topicid
      WHERE 1=1
    `;

    // Add filters with proper escaping to prevent SQL injection
    if (topicIds) {
      const topicIdArray = topicIds.split(',').filter(id => id.trim());
      if (topicIdArray.length > 0) {
        // Sanitize topic IDs (should be UUIDs)
        const sanitizedIds = topicIdArray.map(id => id.replace(/[^a-zA-Z0-9-]/g, ''));
        const placeholders = sanitizedIds.map(id => `'${id}'`).join(',');
        query += ` AND c.topicid IN (${placeholders})`;
      }
    }

    if (program) {
      // Sanitize program name
      const sanitizedProgram = program.replace(/'/g, "''");
      query += ` AND t.program = '${sanitizedProgram}'`;
    }

    if (unit) {
      // Sanitize unit name
      const sanitizedUnit = unit.replace(/'/g, "''");
      query += ` AND t.unit = '${sanitizedUnit}'`;
    }

    query += `
      ORDER BY 
        COALESCE(c.order_index, 999999),
        c.date_created DESC NULLS LAST
      LIMIT ${limit} OFFSET ${offset}
    `;

    console.log('Executing content query:', query);

    // Execute main query
    const result = await db.execute(sql.raw(query));
    
    console.log('Content query result:', result.rows.length, 'rows');

    // Get question counts separately and only for the returned content
    const contentIds = result.rows.map((row: any) => row.id);
    let questionCounts: { [key: string]: number } = {};

    if (contentIds.length > 0) {
      const countQuery = `
        SELECT 
          contentid,
          COUNT(*) as question_count
        FROM meraki.question
        WHERE contentid IN (${contentIds.map(id => `'${id}'`).join(',')})
        GROUP BY contentid
      `;

      const countResult = await db.execute(sql.raw(countQuery));

      questionCounts = countResult.rows.reduce((acc: any, row: any) => {
        acc[row.contentid] = parseInt(row.question_count) || 0;
        return acc;
      }, {});
    }

    // Combine the results
    const processedRows = result.rows.map((row: any) => ({
      ...row,
      question_count: questionCounts[row.id.toString()] || 0
    }));

    return NextResponse.json({
      content: processedRows,
      hasMore: result.rows.length === limit
    });
  } catch (error) {
    console.error('Error fetching paginated content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}
