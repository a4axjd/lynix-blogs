
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  readTime: number;
  featured?: boolean;
}

export interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  authorName: string;
  authorAvatar?: string;
  tags: string[];
  featured: boolean;
}
