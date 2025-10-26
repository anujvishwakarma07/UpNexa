import Image from "next/image";
import SearchForm from "../../components/SearchForm";
import StartupCard, { StartupTypeCard } from "@/components/StartupCard";
import { client } from "@/sanity/lib/client";
import { STARTUPS_QUERY } from "@/sanity/lib/queries";
import { sanityFetch, SanityLive } from "@/sanity/lib/live";
import { auth } from "@/auth";


export default async function Home({ searchParams }: {
  searchParams?: { query?: string }
}) {
  const query = (await searchParams)?.query;
  const params = { search: query || null };

  const session = await auth();
  console.log(session?.id);

  const { data: posts } = await sanityFetch({ query: STARTUPS_QUERY, params });

  // console.log(JSON.stringify(posts, null, 2));

  // const posts = [{
  //   _createdAt: new Date(),
  //   view: "55",
  //   author: { _id: 1, name: "Chandni",  },
  //   _id: 1,
  //   description: "This is a startup",
  //   image: "https://images.unsplash.com/photo-1757293985192-1bef0e4a5f0b?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw2fHx8ZW58MHx8fHx8",
  //   category: "Robots",
  //   title: "We Robots"
  // }]
  return (
    <>
      <section className="pink_container pattern">
        <p className="tag tag-tri">
          Discover and Share Innovative Startup Ideas
        </p>
        <h1 className="heading pattern">Pitch your starup, <br />and connect with enterprenurs  </h1>

        <p className="sub-heading !max-w-3xl"> Submit Ideas, Vote on Pitches, and Get Noticed in Virtual Competitions</p>

        <SearchForm query={query} />
      </section>

      <section className="section_container">
        <p className="text-30-semibold">
          {query ? `Searching for "${query}"` : 'All Startups'}
        </p>

        <ul className="mt-7 card_grid">
          {posts?.length > 0 ? (
            posts.map((post: StartupTypeCard) => (
              <StartupCard key={post?._id} post={post} />
            ))
          ) : (
            <p className="no-results">No startup found</p>
          )}
        </ul>
      </section>
      <SanityLive />
    </>
  );
}
