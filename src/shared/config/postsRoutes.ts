export const POSTS_ROUTES = {
  BASE_URL: "/api", // All requests go to /api
  ENDPOINTS: {
    CREATE: "posts:create",
    GET_ALL: "posts:get-all", 
    GET_BY_ID: "posts:get-by-id", // Remove id from endpoint name
    UPDATE: "posts:update",       // Remove id from endpoint name  
    DELETE: "posts:delete",       // Remove id from endpoint name
    PUBLISH: "posts:publish",
    UNPUBLISH: "posts:unpublish", 
    GET_BY_AUTHOR: "posts:get-by-author",
  } as const,
};