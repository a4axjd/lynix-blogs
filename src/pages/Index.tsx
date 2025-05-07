
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import HeroPost from "@/components/blog/HeroPost";
import BlogCard from "@/components/blog/BlogCard";
import { Button } from "@/components/ui/button";
import { mockBlogs } from "@/lib/mock-data";
import { Link } from "react-router-dom";

const Index = () => {
  // Get featured blogs for hero section
  const featuredBlogs = mockBlogs.filter(blog => blog.featured);
  const heroPost = featuredBlogs[0] || mockBlogs[0];
  
  // Get recent blogs excluding hero post
  const recentBlogs = mockBlogs
    .filter(blog => blog.id !== heroPost.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // Group blogs by tag for categories section
  const allTags = Array.from(new Set(mockBlogs.flatMap(blog => blog.tags)));
  const popularTags = allTags.slice(0, 6); // Just take first 6 tags for this demo
  
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="container">
          <HeroPost blog={heroPost} />
        </div>
      </section>
      
      {/* Recent Posts */}
      <section className="py-12 bg-secondary/50">
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Recent Articles</h2>
            <Button variant="outline" asChild>
              <Link to="/blogs">View All</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentBlogs.map(blog => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Categories */}
      <section className="py-12 md:py-20">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Explore Topics</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {popularTags.map((tag, index) => {
              // Find a blog with this tag for the image
              const blogWithTag = mockBlogs.find(blog => blog.tags.includes(tag));
              return (
                <Link 
                  to={`/blogs?tag=${tag}`}
                  key={index}
                  className="group relative overflow-hidden rounded-lg"
                >
                  <div className="aspect-[16/9] overflow-hidden">
                    <img 
                      src={blogWithTag?.coverImage} 
                      alt={tag}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-lynix-dark-purple/80 to-transparent flex items-end p-6">
                      <h3 className="text-xl font-bold text-white">{tag}</h3>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
      
      {/* Newsletter */}
      <section className="py-12 md:py-20 bg-accent">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-accent-foreground mb-6">
              Get the latest tech stories and tutorials delivered straight to your inbox
            </p>
            
            <form className="flex flex-col sm:flex-row gap-2">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-grow px-4 py-2 rounded-md border border-border bg-background"
                required
              />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
