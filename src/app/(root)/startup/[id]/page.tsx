import { formatDate } from '@/lib/utils';
import { client } from '@/sanity/lib/client';
import { PLAYLIST_BY_SLUG_QUERY, STARTUP_BY_ID_QUERY } from '@/sanity/lib/queries';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import React, { Suspense } from 'react'
import markdownit from 'markdown-it'
import { Skeleton } from '@/components/ui/skeleton';
import View from '@/components/View';
import StartupCard, { StartupTypeCard } from '@/components/StartupCard';

const md = markdownit();

export const experimental_ppr = true;

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const {id} = await params;

 
  const [post, editorPlaylist] = await Promise.all([
    client.fetch(STARTUP_BY_ID_QUERY, { id }),
    client.fetch(PLAYLIST_BY_SLUG_QUERY, {
      slug: "editor-picks-new",
    }).catch((error) => {
      console.error("Failed to fetch editor picks:", error);
      return null;
    }),
  ]);


  if (!post) return notFound();


  let editorPosts: StartupTypeCard[] = [];
  
  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log("Editor Playlist Response:", editorPlaylist);
  }
  
 
  if (editorPlaylist) {

    if (editorPlaylist && typeof editorPlaylist === 'object' && 'select' in editorPlaylist) {
      const selectData = (editorPlaylist as any).select;
      if (Array.isArray(selectData)) {
        editorPosts = selectData.filter(item => item != null);
        console.log(`Found ${editorPosts.length} posts in 'select' property`);
      }
    }
    else if ('posts' in editorPlaylist) {
      const postsData = (editorPlaylist as any).posts;
      if (Array.isArray(postsData)) {
        editorPosts = postsData.filter(item => item != null);
        console.log(`Found ${editorPosts.length} posts in 'posts' property`);
      }
    }
    
    else if ('startups' in editorPlaylist) {
      const startupsData = (editorPlaylist as any).startups;
      if (Array.isArray(startupsData)) {
        editorPosts = startupsData.filter(item => item != null);
        console.log(`Found ${editorPosts.length} posts in 'startups' property`);
      }
    }

        else if (Array.isArray(editorPlaylist)) {
          editorPosts = (editorPlaylist as any[]).filter(item => item != null);
          console.log(`Playlist is directly an array with ${editorPosts.length} items`);
        }

    else if (typeof editorPlaylist === 'object') {
      const keys = Object.keys(editorPlaylist);
      console.log("Available keys in playlist object:", keys);
      
   
      for (const key of keys) {
        const value = (editorPlaylist as any)[key];
        if (Array.isArray(value) && value.length > 0) {
          editorPosts = value.filter(item => item != null);
          console.log(`Found ${editorPosts.length} posts in '${key}' property`);
          break;
        }
      }
    }
  } else {
    console.log("Editor playlist is null or undefined - the slug might not exist or is unpublished");
  }


  const parsedContent = md.render(post?.pitch || "");

  return (
    <>
      <section className="pink_container pattern !min-h-[230px]">
        <p className="tag tag-tri">
          {formatDate(post?._createdAt)}
        </p>

        <h1 className="heading">{post.title}</h1>
        <p className="sub-heading !max-w-5xl">{post.description}</p>
      </section>

      <section className="section_container">
        {post.image && (
          <img
            src={post.image}
            alt="thumbnail"
            className='w-full h-auto rounded-xl'
          />
        )}

        <div className="space-y-5 mt-10 max-w-4xl mx-auto">
          <div className="flex-between gap-5">
            <Link 
              href={`/user/${post.author?._id}`} 
              className='flex gap-2 items-center mb-3'
            >
              <Image
                src={post.author?.image || '/default-avatar.png'} 
                alt='avatar'
                width={65}
                height={65} 
                className='rounded-full drop-shadow-lg'
              />

              <div>
                <p className="text-20-medium">{post.author?.name}</p>
                <p className="text-16-medium !text-black-300">
                  @{post.author?.username}
                </p>
              </div>
            </Link>

            <p className="category-tag">{post.category}</p>
          </div>

          <h3 className="text-30-bold">Pitch Details</h3>
          
          {parsedContent ? (
            <article
              className="prose max-w-4xl font-work-sans break-all"
              dangerouslySetInnerHTML={{ __html: parsedContent }}
            />
          ) : (
            <p className="no-result">No details provided</p>
          )}
        </div>

        <hr className="divider" />

        {/* Editor Picks Section - Only show if we have posts */}
        {editorPosts && editorPosts.length > 0 ? (
          <div className="max-w-4xl mx-auto">
            <p className="text-30-semibold">Editor Picks</p>

            <ul className="mt-7 card_grid-sm">
              {editorPosts.map((post: StartupTypeCard, index: number) => (
                <StartupCard key={post._id || index} post={post} />
              ))}
            </ul>
          </div>
        ) : (
          // Optional: Show a message when no editor picks are available
          process.env.NODE_ENV === 'development' && (
            <div className="max-w-4xl mx-auto">
              <p className="text-16-medium text-gray-500">
                No editor picks available. Check console for debugging info.
              </p>
            </div>
          )
        )}

        <Suspense fallback={<Skeleton className='view_skeleton' />}>
          <View id={id} initialViews={0}/>
        </Suspense>
      </section>
    </>
  );
};

export default page;