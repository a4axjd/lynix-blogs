
import { useState, useEffect } from "react";
import BlogCard from "./BlogCard";
import { BlogPost } from "@/types/blog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface BlogGridProps {
  blogs: BlogPost[];
}

const BlogGrid = ({ blogs }: BlogGridProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [filteredBlogs, setFilteredBlogs] = useState(blogs);
  
  // Get all unique tags from blogs
  const allTags = Array.from(
    new Set(blogs.flatMap(blog => blog.tags))
  ).sort();
  
  // Filter blogs based on search term and selected tag
  useEffect(() => {
    let result = blogs;
    
    if (searchTerm.trim() !== "") {
      result = result.filter(blog => 
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedTag) {
      result = result.filter(blog => blog.tags.includes(selectedTag));
    }
    
    setFilteredBlogs(result);
  }, [blogs, searchTerm, selectedTag]);
  
  return (
    <div className="space-y-6">
      {/* Search and filter */}
      <div className="space-y-4">
        <Input
          type="text"
          placeholder="Search blogs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        
        <div className="flex gap-2 flex-wrap">
          <Badge
            variant={selectedTag === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedTag(null)}
          >
            All
          </Badge>
          
          {allTags.map(tag => (
            <Badge
              key={tag}
              variant={selectedTag === tag ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      
      {/* Results count */}
      <p className="text-muted-foreground">
        Showing {filteredBlogs.length} {filteredBlogs.length === 1 ? "blog" : "blogs"}
      </p>
      
      {/* Blog grid */}
      {filteredBlogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map(blog => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-xl font-medium mb-2">No blogs found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search term
          </p>
        </div>
      )}
    </div>
  );
};

export default BlogGrid;
