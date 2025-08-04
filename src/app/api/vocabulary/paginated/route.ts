import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { vocabulary } from '@/lib/schema';
import { desc, ilike, and, sql, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const letter = searchParams.get('letter') || '';
    const tag = searchParams.get('tag') || '';

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];

    // Search filter
    if (search) {
      conditions.push(
        sql`(${vocabulary.word} ILIKE ${`%${search}%`} OR ${vocabulary.definition} ILIKE ${`%${search}%`})`
      );
    }

    // Letter filter
    if (letter && letter !== 'All') {
      conditions.push(
        sql`UPPER(LEFT(${vocabulary.word}, 1)) = ${letter.toUpperCase()}`
      );
    }

    // Tag filter
    if (tag && tag !== 'All') {
      conditions.push(
        sql`${tag} = ANY(${vocabulary.tags})`
      );
    }

    // Combine conditions
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count for pagination metadata
    const totalCountResult = await db
      .select({ count: count() })
      .from(vocabulary)
      .where(whereClause);

    const totalCount = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Get paginated vocabulary items
    const vocabularyItems = await db
      .select()
      .from(vocabulary)
      .where(whereClause)
      .orderBy(desc(vocabulary.createdAt))
      .limit(limit)
      .offset(offset);

    // Get all unique tags for filter options (only on first page to avoid repeated queries)
    let allTags: string[] = [];
    if (page === 1) {
      const allTagsResult = await db
        .select({ tags: vocabulary.tags })
        .from(vocabulary)
        .where(sql`${vocabulary.tags} IS NOT NULL AND array_length(${vocabulary.tags}, 1) > 0`)
        .limit(100); // Limit to avoid performance issues with large datasets

      const tagsSet = new Set<string>();
      allTagsResult.forEach(item => {
        if (item.tags) {
          item.tags.forEach(tag => tagsSet.add(tag));
        }
      });
      allTags = Array.from(tagsSet).sort();
    }

    return NextResponse.json({
      vocabularyItems,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      },
      allTags: allTags
    });
  } catch (error) {
    console.error('Error fetching paginated vocabulary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vocabulary items' },
      { status: 500 }
    );
  }
}
