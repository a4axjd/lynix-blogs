
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import BlogCard from "@/components/blog/BlogCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, ClockIcon, ArrowLeft, Share2Icon } from "lucide-react";
import { mockBlogs } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import { BlogPost } from "@/types/blog";
import NotFound from "./NotFound";

// For rendering markdown
import ReactMarkdown from "react-markdown";

const BlogDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Find the blog with the matching ID
    const foundBlog = mockBlogs.find(b => b.id === id);
    
    if (foundBlog) {
      setBlog(foundBlog);
      
      // Find related blogs based on shared tags
      const related = mockBlogs
        .filter(b => b.id !== id && b.tags.some(tag => foundBlog.tags.includes(tag)))
        .slice(0, 3);
      
      setRelatedBlogs(related);
    }
    
    setIsLoading(false);
  }, [id]);
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-20 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4">Loading article...</p>
        </div>
      </MainLayout>
    );
  }
  
  if (!blog) {
    return <NotFound />;
  }
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.excerpt,
        url: window.location.href
      }).catch(err => console.error('Error sharing', err));
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };
  
  return (
    <MainLayout>
      {/* Back button and share */}
      <div className="container py-6">
        <div className="flex justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/blogs" className="flex items-center gap-1">
              <ArrowLeft size={16} />
              Back to blogs
            </Link>
          </Button>
          
          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2Icon size={20} />
          </Button>
        </div>
      </div>
      
      {/* Article header */}
      <section className="py-8">
        <div className="container max-w-4xl">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            {blog.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-2">
              <img 
                src={blog.authorAvatar || 'https://i.pravatar.cc/150?img=1'}
                alt={blog.authorName}
                className="w-8 h-8 rounded-full"
              />
              <span>{blog.authorName}</span>
            </div>
            
            <div className="flex items-center">
              <CalendarIcon size={16} className="mr-1" />
              {formatDate(blog.createdAt)}
            </div>
            
            <div className="flex items-center">
              <ClockIcon size={16} className="mr-1" />
              {blog.readTime} min read
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap mb-8">
            {blog.tags.map((tag, index) => (
              <Badge key={index} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </section>
      
      {/* Hero image */}
      <section className="pb-8">
        <div className="container max-w-4xl">
          <div className="rounded-lg overflow-hidden">
            <img 
              src={blog.coverImage} 
              alt={blog.title}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>
      
      {/* Article content */}
      <article className="py-8">
        <div className="container max-w-3xl">
          <div className="prose-lynix">
            <ReactMarkdown>{blog.content}</ReactMarkdown>
          </div>
          
          <Separator className="my-10" />
          
          <div className="flex flex-wrap gap-2 mb-10">
            {blog.tags.map((tag, index) => (
              <Link to={`/blogs?tag=${tag}`} key={index}>
                <Badge variant="outline" className="hover:bg-secondary transition-colors">
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </article>
      
      {/* Related articles */}
      {relatedBlogs.length > 0 && (
        <section className="py-12 bg-secondary/50">
          <div className="container">
            <h2 className="text-2xl font-bold mb-8">Related Articles</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.map(blog => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          </div>
        </section>
      )}
    </MainLayout>
  );
};

export default BlogDetail;
