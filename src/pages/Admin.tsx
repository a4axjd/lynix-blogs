
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Plus, Pencil, Trash2, AlertTriangle, Loader2, LogOut } from "lucide-react";
import ImageUploader from "@/components/blog/ImageUploader";
import { BlogFormData, BlogPost } from "@/types/blog";
import { formatDate } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { signOut } from "@/lib/supabase-auth";
import { 
  fetchAllBlogs, 
  createBlog, 
  updateBlog, 
  deleteBlog 
} from "@/lib/supabase-blogs";

const Admin = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<string | null>(null);
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

  // Fetch blogs on load
  useEffect(() => {
    const loadBlogs = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAllBlogs();
        setBlogs(data);
      } catch (error) {
        console.error("Error loading blogs:", error);
        toast({
          title: "Error",
          description: "Failed to load blog posts. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadBlogs();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewBlog(prev => ({ ...prev, [name]: value }));
  };

  // Handle featured toggle
  const handleFeaturedToggle = (checked: boolean) => {
    setNewBlog(prev => ({ ...prev, featured: checked }));
  };

  // Handle image upload
  const handleImageUploaded = (url: string) => {
    setNewBlog(prev => ({ ...prev, coverImage: url }));
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
    setActiveTab("create");
  };

  // Show delete confirmation
  const handleShowDeleteConfirm = (id: string) => {
    setBlogToDelete(id);
    setShowConfirmDialog(true);
  };

  // Delete a blog
  const handleConfirmDelete = async () => {
    if (!blogToDelete) return;
    
    try {
      await deleteBlog(blogToDelete);
      setBlogs(prev => prev.filter(blog => blog.id !== blogToDelete));
      setShowConfirmDialog(false);
      setBlogToDelete(null);
      
      toast({
        title: "Blog deleted",
        description: "The blog post has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast({
        title: "Error",
        description: "Failed to delete blog post. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    const success = await signOut();
    if (success) {
      navigate("/auth");
    }
  };

  // Submit the form to create/update a blog
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newBlog.coverImage) {
      toast({
        title: "Image required",
        description: "Please upload a cover image for the blog post.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      if (editingBlogId) {
        // Update existing blog
        const updatedBlog = await updateBlog(editingBlogId, newBlog);
        
        setBlogs(prev => prev.map(blog => 
          blog.id === editingBlogId ? updatedBlog : blog
        ));
        
        toast({
          title: "Blog updated",
          description: "Your changes have been saved successfully.",
        });
      } else {
        // Create new blog
        const createdBlog = await createBlog(newBlog);
        
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
      setActiveTab("posts");
    } catch (error) {
      console.error("Error saving blog:", error);
      toast({
        title: "Error",
        description: "Failed to save blog post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="container py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Blog Management</h1>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <Alert className="mb-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            You're now working with real data stored in Supabase. Changes made here will persist.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="posts">All Posts</TabsTrigger>
            <TabsTrigger value="create">{editingBlogId ? "Edit Post" : "Create Post"}</TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p>Loading blog posts...</p>
                </div>
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-20">
                <h3 className="text-xl font-medium mb-2">No blog posts yet</h3>
                <p className="text-muted-foreground mb-6">Create your first blog post to get started</p>
                <Button onClick={() => setActiveTab("create")}>Create New Post</Button>
              </div>
            ) : (
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
                              onClick={() => handleShowDeleteConfirm(blog.id)}
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
            )}
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
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                    <div className="space-y-6 order-2 md:order-1">
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
                        <Label htmlFor="content">Content (Markdown)</Label>
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
                    
                    <div className="order-1 md:order-2">
                      <div className="grid gap-2">
                        <Label htmlFor="coverImage">Cover Image</Label>
                        <ImageUploader
                          onImageUploaded={handleImageUploaded}
                          currentImage={newBlog.coverImage}
                        />
                        {!newBlog.coverImage && (
                          <p className="text-sm text-muted-foreground mt-1">
                            A cover image is required
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <CardFooter className="px-0 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setActiveTab("posts");
                        setEditingBlogId(null);
                        setNewBlog({
                          title: "",
                          excerpt: "",
                          content: "",
                          coverImage: "",
                          authorName: "",
                          tags: [],
                          featured: false
                        });
                      }}
                      className="mr-2"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editingBlogId ? "Update Post" : "Create Post"}
                    </Button>
                  </CardFooter>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this blog post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Admin;
