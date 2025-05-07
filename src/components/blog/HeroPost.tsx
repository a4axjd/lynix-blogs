
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { BlogPost } from "@/types/blog";

interface HeroPostProps {
  blog: BlogPost;
}

const HeroPost = ({ blog }: HeroPostProps) => {
  return (
    <Card className="overflow-hidden border-0 shadow-none bg-transparent">
      <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
        <div className="space-y-4 md:order-2">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center">
              <CalendarIcon size={16} className="mr-1" />
              {new Date(blog.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <ClockIcon size={16} className="mr-1" />
              {blog.readTime} min read
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            {blog.title}
          </h1>
          
          <p className="text-lg text-muted-foreground">
            {blog.excerpt}
          </p>
          
          <div className="pt-4">
            <Button asChild>
              <Link to={`/blog/${blog.id}`}>
                Read Article
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="md:order-1 rounded-lg overflow-hidden">
          <img 
            src={blog.coverImage} 
            alt={blog.title}
            className="w-full h-full object-cover aspect-[16/9]"
          />
        </div>
      </div>
    </Card>
  );
};

export default HeroPost;
