import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';
import { writeClient } from '@/sanity/lib/write-client';
import { STARTUP_VIEWS_QUERY } from '@/sanity/lib/queries';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    const data = await client.withConfig({ useCdn: false }).fetch(STARTUP_VIEWS_QUERY, { id });
    const currentViews = data?.views ?? 0;

    await writeClient.patch(id).set({ views: currentViews + 1 }).commit();

    return NextResponse.json({ views: currentViews + 1 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to increment views' }, { status: 500 });
  }
}
