import { defineQuery } from "next-sanity";

// Search / list query
export const STARTUPS_QUERY = `*[_type == "startup" && (
  !defined($search) || title match $search || description match $search
)] | order(_createdAt desc) {
  _id,
  _type,
  _rev,
  _createdAt,
  _updatedAt,
  title,
  slug,
  author->{_id, name, image, bio},
  views,
  description,
  category,
  image
}`;



// Get single startup by ID
export const STARTUP_BY_ID_QUERY = defineQuery(`*[_type == "startup" && _id == $id][0] {
  _id,
  title,
  slug,
  _createdAt,
  author -> {
    _id,
    name,
    username,
    image,
    bio
  },
  views,
  description,
  category,
  image,
  pitch
}`);

// Only views
export const STARTUP_VIEWS_QUERY = defineQuery(`*[_type == "startup" && _id == $id][0] {
  _id,
  views
}`);


export const AUTHOR_BY_GITHUB_ID_QUERY = defineQuery(`*[_type == "author" && id == $id][0]{
    _id,
    id,
    name,
    username,
    email,
    image,
    bio
}`)
export const AUTHOR_BY_ID_QUERY = defineQuery(`*[_type == "author" && _id == $id][0]{
    _id,
    id,
    name,
    username,
    email,
    image,
    bio
}`)

export const STARTUPS_BY_AUTHOR_QUERY =
  defineQuery(`*[_type == "startup" && author._ref == $id] | order(_createdAt desc) {
  _id, 
  title, 
  slug,
  _createdAt,
  author -> {
    _id, name, image, bio
  }, 
  views,
  description,
  category,
  image,
}`);