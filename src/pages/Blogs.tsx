
import React, { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import BlogGrid from "@/components/blog/BlogGrid";
import { useSearchParams } from "react-router-dom";
import { BlogPost } from "@/types/blog";
import { fetchAllBlogs, fetchBlogsByTag } from "@/lib/supabase-blogs";
import { toast } from "@/components/ui/use-toast";

const Blogs = () => {
  const [searchParams] = useSearchParams();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const tagFilter = searchParams.get('tag');
  
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        let data;
        if (tagFilter) {
          data = await fetchBlogsByTag(tagFilter);
        } else {
          data = await fetchAllBlogs();
        }
        setBlogs(data);
      } catch (error) {
        console.error("Error fetching blogs:", error);
        toast({
          title: "Error",
          description: "Failed to load blog posts. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlogs();
  }, [tagFilter]);
  
  return (
    <MainLayout>
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="max-w-3xl mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {tagFilter ? `Articles on ${tagFilter}` : "All Articles"}
            </h1>
            <p className="text-muted-foreground text-lg">
              {tagFilter
                ? `Explore our collection of articles about ${tagFilter}`
                : "Dive into our library of tech articles, tutorials, and insights"
              }
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <BlogGrid blogs={blogs} />
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default Blogs;
