// Remove problematic indexes
db["Blog"].dropIndex("slugBlog_1")
db["Blog"].dropIndex("BlogSlug_1") 

// Remove the slugBlog field causing issues
db["Blog"].updateMany(
  { slugBlog: { $exists: true } },
  { $unset: { slugBlog: "" } }
)

// Create proper sparse index
db["Blog"].createIndex(
  { slug: 1 }, 
  { unique: true, sparse: true, name: "slug_unique_sparse" }
)