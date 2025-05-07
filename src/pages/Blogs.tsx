
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import BlogGrid from "@/components/blog/BlogGrid";
import { mockBlogs } from "@/lib/mock-data";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { BlogPost } from "@/types/blog";

const Blogs = () => {
  const [searchParams] = useSearchParams();
  const [blogs, setBlogs] = useState<BlogPost[]>(mockBlogs);
  const tagFilter = searchParams.get('tag');
  
  useEffect(() => {
    // If tag parameter is provided, filter blogs
    if (tagFilter) {
      const filtered = mockBlogs.filter(blog => 
        blog.tags.includes(tagFilter)
      );
      setBlogs(filtered);
    } else {
      setBlogs(mockBlogs);
    }
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
          
          <BlogGrid blogs={blogs} />
        </div>
      </section>
    </MainLayout>
  );
};

export default Blogs;
