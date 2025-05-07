
import { supabase } from "@/integrations/supabase/client";
import { BlogPost, BlogFormData } from "@/types/blog";
import { deleteImage } from "./supabase-storage";

// Fetch all blogs from Supabase
export async function fetchAllBlogs() {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching blogs:', error);
    throw error;
  }

  return data.map(transformSupabaseBlog);
}

// Fetch blogs by tag
export async function fetchBlogsByTag(tag: string) {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .contains('tags', [tag])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching blogs by tag:', error);
    throw error;
  }

  return data.map(transformSupabaseBlog);
}

// Fetch a single blog by ID
export async function fetchBlogById(id: string) {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching blog:', error);
    throw error;
  }

  return transformSupabaseBlog(data);
}

// Fetch featured blogs
export async function fetchFeaturedBlogs() {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('featured', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching featured blogs:', error);
    throw error;
  }

  return data.map(transformSupabaseBlog);
}

// Create a new blog
export async function createBlog(blog: BlogFormData) {
  // Generate a slug from the title
  const slug = blog.title.toLowerCase().replace(/[^\w\s]/gi, "").replace(/\s+/g, "-");
  
  // Calculate read time based on content length (estimate)
  const words = blog.content.trim().split(/\s+/).length;
  const readTime = Math.ceil(words / 200) || 1; // Assuming 200 words per minute
  
  const { data, error } = await supabase
    .from('blogs')
    .insert([{
      title: blog.title,
      slug,
      excerpt: blog.excerpt,
      content: blog.content,
      cover_image: blog.coverImage,
      author_name: blog.authorName,
      author_avatar: blog.authorAvatar,
      tags: blog.tags,
      featured: blog.featured,
      read_time: readTime
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating blog:', error);
    throw error;
  }

  return transformSupabaseBlog(data);
}

// Update an existing blog
export async function updateBlog(id: string, blog: BlogFormData) {
  // Calculate read time based on content length
  const words = blog.content.trim().split(/\s+/).length;
  const readTime = Math.ceil(words / 200) || 1;
  
  const { data, error } = await supabase
    .from('blogs')
    .update({
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      cover_image: blog.coverImage,
      author_name: blog.authorName,
      author_avatar: blog.authorAvatar,
      tags: blog.tags,
      featured: blog.featured,
      read_time: readTime
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating blog:', error);
    throw error;
  }

  return transformSupabaseBlog(data);
}

// Delete a blog
export async function deleteBlog(id: string) {
  // First get the blog to access its cover image
  const { data: blog } = await supabase
    .from('blogs')
    .select('cover_image')
    .eq('id', id)
    .single();
    
  // Delete the blog from the database
  const { error } = await supabase
    .from('blogs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting blog:', error);
    throw error;
  }
  
  // If image was uploaded to Supabase Storage, try to delete it
  if (blog?.cover_image && blog.cover_image.includes('blog_images')) {
    await deleteImage(blog.cover_image);
  }

  return true;
}

// Helper function to transform Supabase blog format to app BlogPost format
function transformSupabaseBlog(blog: any): BlogPost {
  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt,
    content: blog.content,
    coverImage: blog.cover_image,
    authorName: blog.author_name,
    authorAvatar: blog.author_avatar || undefined,
    createdAt: blog.created_at,
    updatedAt: blog.updated_at,
    tags: blog.tags || [],
    readTime: blog.read_time,
    featured: blog.featured
  };
}
