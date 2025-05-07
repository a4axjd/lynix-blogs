
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export async function uploadImage(file: File): Promise<string | null> {
  try {
    // Create a unique file name using timestamp and original file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    
    // Upload image to Supabase Storage
    const { data, error } = await supabase.storage
      .from('blog_images')
      .upload(fileName, file);
    
    if (error) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }

    // Get the public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('blog_images')
      .getPublicUrl(data.path);
    
    return publicUrl;
  } catch (error) {
    console.error("Image upload error:", error);
    toast({
      title: "Upload failed",
      description: "An unexpected error occurred during file upload.",
      variant: "destructive",
    });
    return null;
  }
}

export async function deleteImage(imageUrl: string): Promise<boolean> {
  try {
    // Extract file path from the URL
    const { data: { publicUrl } } = supabase.storage.from('blog_images').getPublicUrl('');
    const basePath = publicUrl.split('/').slice(0, -1).join('/');
    
    // Get the file name from the full URL by removing the base path
    const filePath = imageUrl.replace(basePath + '/', '');
    
    if (!filePath) {
      console.error("Invalid image URL format");
      return false;
    }
    
    const { error } = await supabase.storage
      .from('blog_images')
      .remove([filePath]);
    
    if (error) {
      console.error("Failed to delete image:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Image deletion error:", error);
    return false;
  }
}
