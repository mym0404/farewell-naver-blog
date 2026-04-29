import { NaverBlogSE2Editor } from "../editor/NaverBlogSe2Editor.js"
import { NaverBlogSE3Editor } from "../editor/NaverBlogSe3Editor.js"
import { NaverBlogSE4Editor } from "../editor/NaverBlogSe4Editor.js"
import { BaseBlog } from "./BaseBlog.js"

export class NaverBlog extends BaseBlog {
  override readonly editors = [
    new NaverBlogSE4Editor(),
    new NaverBlogSE3Editor(),
    new NaverBlogSE2Editor(),
  ]
}
