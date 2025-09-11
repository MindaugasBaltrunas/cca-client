// PostsList.tsx
import React from "react";
import { usePosts } from "../../../core/auth/hooks/usePosts";
import { useGetAllPosts } from "../../../core/auth/hooks/usePostsQueries";
import type { PostResponse } from "../../../core/auth/hooks/usePostsQueries";

function PostsList() {
  // query hook (call at top level)
  const allPostsQuery = useGetAllPosts({ page: 1, limit: 20 });

  // mutations from your convenience hook (also a hook, call at top level)
  const { deletePost } = usePosts(); // assumes usePosts() returns { deletePost, createPost, updatePost, ... }

  const isDeleting = deletePost?.isPending ?? false;

  if (allPostsQuery.isLoading) return <div>Loading...</div>;
  if (allPostsQuery.isError)
    return (
      <div>
        Error: {String(allPostsQuery.error?.message ?? allPostsQuery.error)}
      </div>
    );

  // Some APIs return { data: Post[] } and some return Post[] directly.
  // Normalize to an array so rendering is robust.
  const posts: PostResponse[] =
    (allPostsQuery.data && (allPostsQuery.data as any).data) ??
    (allPostsQuery.data as any) ??
    [];

  if (!posts.length) return <div>No posts found.</div>;

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>
          <h3>{post.title}</h3>
          <button
            onClick={() => {
              // defensive: ensure deletePost exists and has mutate
              if (!deletePost || typeof deletePost.mutate !== "function") {
                console.error("deletePost mutation not available");
                return;
              }
              deletePost.mutate(post.id);
            }}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </button>
        </li>
      ))}
    </ul>
  );
}

export default PostsList;
