
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Trash2, Upload, Image } from 'lucide-react';
import { uploadImage } from '@/lib/supabase-storage';

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUploaded, currentImage }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Create temp preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      
      // Upload to Supabase Storage
      const imageUrl = await uploadImage(file);
      
      // Cleanup temp preview
      URL.revokeObjectURL(objectUrl);
      
      if (imageUrl) {
        setPreview(imageUrl);
        onImageUploaded(imageUrl);
        toast({
          title: "Image uploaded",
          description: "Your image has been uploaded successfully.",
        });
      } else {
        // Reset preview if upload failed
        setPreview(currentImage || null);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      setPreview(currentImage || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setPreview(null);
    onImageUploaded('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-56 object-cover rounded-md border"
          />
          <Button
            size="sm"
            variant="destructive"
            className="absolute top-2 right-2"
            onClick={handleReset}
            type="button"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div 
          onClick={handleClick}
          className="w-full h-56 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
        >
          <Image className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Click to upload image</p>
          <p className="text-xs text-muted-foreground mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
        </div>
      )}
      
      <div className="flex items-center">
        <Button 
          type="button" 
          onClick={handleClick}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              {preview ? 'Change Image' : 'Upload Image'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ImageUploader;
