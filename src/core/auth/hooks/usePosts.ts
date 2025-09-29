// usePosts.ts
import { useGetAllPosts, useGetPost } from "./usePostsQueries";
import { usePostMutations } from "./usePostMutations";

export function usePosts() {
  const {
    createPostMutation,
    updatePostMutation,
    deletePostMutation,
    // togglePostStatusMutation,
    ...rest
  } = usePostMutations();
  return {
    useGetAllPosts,
    useGetPost,
    createPost: createPostMutation,
    updatePost: updatePostMutation,
    deletePost: deletePostMutation,    
    ...rest, 
  };
}
