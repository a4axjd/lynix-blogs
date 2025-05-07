
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ClockIcon, TagIcon } from "lucide-react";
import { BlogPost } from "@/types/blog";

interface BlogCardProps {
  blog: BlogPost;
  variant?: "default" | "featured";
}

const BlogCard = ({ blog, variant = "default" }: BlogCardProps) => {
  const isFeatured = variant === "featured";
  
  return (
    <Link to={`/blog/${blog.id}`}>
      <Card className={`group overflow-hidden transition-all duration-300 h-full 
        ${isFeatured ? 'hover:shadow-xl' : 'hover:shadow-md'} 
        hover:border-accent/50`}
      >
        <div className={`overflow-hidden ${isFeatured ? 'aspect-[16/9]' : 'aspect-[16/10]'}`}>
          <img 
            src={blog.coverImage} 
            alt={blog.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        
        <CardHeader className={`pb-2 ${isFeatured ? 'pt-4' : ''}`}>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <div className="flex items-center">
              <CalendarIcon size={14} className="mr-1" />
              {new Date(blog.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <ClockIcon size={14} className="mr-1" />
              {blog.readTime} min read
            </div>
          </div>
          <h3 className={`${isFeatured ? 'text-xl md:text-2xl' : 'text-lg'} font-semibold tracking-tight line-clamp-2 group-hover:text-lynix-purple transition-colors`}>
            {blog.title}
          </h3>
        </CardHeader>
        
        <CardContent className="py-2">
          <p className="text-muted-foreground text-sm line-clamp-2">
            {blog.excerpt}
          </p>
        </CardContent>
        
        <CardFooter>
          <div className="flex flex-wrap gap-2">
            {blog.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="px-2 py-0.5 text-xs">
                <TagIcon size={12} className="mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default BlogCard;
