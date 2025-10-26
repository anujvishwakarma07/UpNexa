import {blockContentType} from './blockContentType'
import {categoryType} from './categoryType'
import {postType} from './postType'
import {authorType} from './authorType'
import { author } from './author'
import { startup } from './startup'
import { playlist } from './playlist'

export const schema: { types: any[] } = {
  types: [blockContentType, categoryType, postType, author, startup, playlist],
}
