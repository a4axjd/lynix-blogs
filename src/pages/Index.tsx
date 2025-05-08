import React, { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import HeroPost from "@/components/blog/HeroPost";
import BlogCard from "@/components/blog/BlogCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { fetchFeaturedBlogs, fetchAllBlogs } from "@/lib/supabase-blogs";
import { BlogPost } from "@/types/blog";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import NewsletterForm from "@/components/newsletter/NewsletterForm";

const Index = () => {
  const [heroPost, setHeroPost] = useState<BlogPost | null>(null);
  const [recentBlogs, setRecentBlogs] = useState<BlogPost[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get featured blogs for hero section
        const featuredBlogs = await fetchFeaturedBlogs();
        
        // Get all blogs for recent section and tags
        const allBlogs = await fetchAllBlogs();
        
        // Set hero post
        const heroPost = featuredBlogs[0] || allBlogs[0];
        setHeroPost(heroPost);
        
        // Set recent blogs excluding hero post
        if (heroPost) {
          const recent = allBlogs
            .filter(blog => blog.id !== heroPost.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3);
          setRecentBlogs(recent);
        }
        
        // Extract all tags from blogs
        const allTags = Array.from(new Set(allBlogs.flatMap(blog => blog.tags)));
        setPopularTags(allTags.slice(0, 6)); // Take first 6 tags
      } catch (error) {
        console.error("Error fetching blogs:", error);
        toast({
          title: "Error",
          description: "Failed to load blog data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-4">Loading blog content...</p>
        </div>
      </MainLayout>
    );
  }
  
  if (!heroPost) {
    return (
      <MainLayout>
        <div className="container py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">No blogs found</h2>
          <p className="text-muted-foreground mb-6">Start by creating your first blog post</p>
          <Button asChild>
            <Link to="/admin">Create Blog</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }
  
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
          
          {recentBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentBlogs.map(blog => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No recent articles found</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Categories */}
      {popularTags.length > 0 && (
        <section className="py-12 md:py-20">
          <div className="container">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">Explore Topics</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {popularTags.map((tag, index) => {
                // Find a blog with this tag for the image
                const blogWithTag = recentBlogs.find(blog => blog.tags.includes(tag)) || 
                                    heroPost.tags.includes(tag) ? heroPost : null;
                
                return (
                  <Link 
                    to={`/blogs?tag=${tag}`}
                    key={index}
                    className="group relative overflow-hidden rounded-lg"
                  >
                    <div className="aspect-[16/9] overflow-hidden">
                      <img 
                        src={blogWithTag?.coverImage || "https://placehold.co/600x400?text=Topic"}
                        alt={tag}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-lynix-dark-purple/80 to-transparent flex items-end p-6">
                        <h3 className="text-xl font-bold text-white">{tag}</h3>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
      
      {/* Newsletter */}
      <section className="py-12 md:py-20 bg-accent">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-accent-foreground mb-6">
              Get the latest tech stories and tutorials delivered straight to your inbox
            </p>
            
            <NewsletterForm className="max-w-md mx-auto" />
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
