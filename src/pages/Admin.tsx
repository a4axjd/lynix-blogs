
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { mockBlogs } from "@/lib/mock-data";
import { BlogFormData, BlogPost } from "@/types/blog";
import { formatDate, estimateReadTime } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Admin = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>(mockBlogs);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [newBlog, setNewBlog] = useState<BlogFormData>({
    title: "",
    excerpt: "",
    content: "",
    coverImage: "",
    authorName: "",
    tags: [],
    featured: false
  });
  const [currentTag, setCurrentTag] = useState("");

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewBlog(prev => ({ ...prev, [name]: value }));
  };

  // Handle featured toggle
  const handleFeaturedToggle = (checked: boolean) => {
    setNewBlog(prev => ({ ...prev, featured: checked }));
  };

  // Add a tag to the blog
  const handleAddTag = () => {
    if (currentTag.trim() && !newBlog.tags.includes(currentTag.trim())) {
      setNewBlog(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag("");
    }
  };

  // Remove a tag from the blog
  const handleRemoveTag = (tagToRemove: string) => {
    setNewBlog(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Edit an existing blog
  const handleEditBlog = (blog: BlogPost) => {
    setEditingBlogId(blog.id);
    setNewBlog({
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      coverImage: blog.coverImage,
      authorName: blog.authorName,
      authorAvatar: blog.authorAvatar,
      tags: [...blog.tags],
      featured: blog.featured || false
    });
  };

  // Delete a blog
  const handleDeleteBlog = (id: string) => {
    setBlogs(prev => prev.filter(blog => blog.id !== id));
    toast({
      title: "Blog deleted",
      description: "The blog post has been successfully deleted.",
    });
  };

  // Submit the form to create/update a blog
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingBlogId) {
      // Update existing blog
      const updatedBlogs = blogs.map(blog => {
        if (blog.id === editingBlogId) {
          return {
            ...blog,
            ...newBlog,
            updatedAt: new Date().toISOString()
          };
        }
        return blog;
      });
      
      setBlogs(updatedBlogs);
      toast({
        title: "Blog updated",
        description: "Your changes have been saved successfully.",
      });
    } else {
      // Create new blog
      const newId = (blogs.length + 1).toString();
      const now = new Date().toISOString();
      
      const createdBlog: BlogPost = {
        id: newId,
        slug: newBlog.title.toLowerCase().replace(/[^\w\s]/gi, "").replace(/\s+/g, "-"),
        readTime: estimateReadTime(newBlog.content),
        createdAt: now,
        updatedAt: now,
        ...newBlog
      };
      
      setBlogs(prev => [...prev, createdBlog]);
      toast({
        title: "Blog created",
        description: "Your new blog post has been created successfully.",
      });
    }
    
    // Reset form
    setNewBlog({
      title: "",
      excerpt: "",
      content: "",
      coverImage: "",
      authorName: "",
      tags: [],
      featured: false
    });
    setEditingBlogId(null);
  };

  return (
    <MainLayout>
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Blog Management</h1>

        <Alert className="mb-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            This is a demo admin interface. In the real application, this would connect to Supabase for data persistence.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="posts">
          <TabsList className="mb-6">
            <TabsTrigger value="posts">All Posts</TabsTrigger>
            <TabsTrigger value="create">{editingBlogId ? "Edit Post" : "Create Post"}</TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <div className="grid grid-cols-1 gap-6">
              {blogs.map(blog => (
                <Card key={blog.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-48 h-48 overflow-hidden">
                      <img
                        src={blog.coverImage}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex flex-col h-full">
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-semibold mb-2">{blog.title}</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                By {blog.authorName} • {formatDate(blog.createdAt)} • {blog.readTime} min read
                              </p>
                            </div>
                            {blog.featured && (
                              <Badge>Featured</Badge>
                            )}
                          </div>

                          <p className="text-muted-foreground mb-4 line-clamp-2">
                            {blog.excerpt}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {blog.tags.map((tag, index) => (
                              <Badge key={index} variant="outline">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 justify-end pt-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditBlog(blog)}
                          >
                            <Pencil size={16} className="mr-1" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteBlog(blog.id)}
                          >
                            <Trash2 size={16} className="mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>{editingBlogId ? "Edit Post" : "Create New Post"}</CardTitle>
                <CardDescription>
                  {editingBlogId 
                    ? "Update your blog post with the form below." 
                    : "Fill out the form below to create a new blog post."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="Enter blog title"
                        value={newBlog.title}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="excerpt">Excerpt</Label>
                      <Textarea
                        id="excerpt"
                        name="excerpt"
                        placeholder="Brief description of your blog"
                        value={newBlog.excerpt}
                        onChange={handleInputChange}
                        required
                        rows={3}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        name="content"
                        placeholder="Write your blog content in markdown format"
                        value={newBlog.content}
                        onChange={handleInputChange}
                        required
                        rows={10}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="coverImage">Cover Image URL</Label>
                      <Input
                        id="coverImage"
                        name="coverImage"
                        placeholder="Enter image URL"
                        value={newBlog.coverImage}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="authorName">Author Name</Label>
                      <Input
                        id="authorName"
                        name="authorName"
                        placeholder="Enter author name"
                        value={newBlog.authorName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="authorAvatar">Author Avatar URL (optional)</Label>
                      <Input
                        id="authorAvatar"
                        name="authorAvatar"
                        placeholder="Enter author avatar URL"
                        value={newBlog.authorAvatar || ""}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>Tags</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {newBlog.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 text-muted-foreground hover:text-foreground"
                            >
                              <X size={14} />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag"
                          value={currentTag}
                          onChange={(e) => setCurrentTag(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                        />
                        <Button type="button" onClick={handleAddTag} size="sm">
                          <Plus size={16} className="mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        id="featured"
                        checked={newBlog.featured}
                        onCheckedChange={handleFeaturedToggle}
                      />
                      <Label htmlFor="featured">Featured Post</Label>
                    </div>
                  </div>

                  <CardFooter className="px-0 pt-4">
                    <Button type="submit" className="ml-auto">
                      {editingBlogId ? "Update Post" : "Create Post"}
                    </Button>
                  </CardFooter>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Admin;
