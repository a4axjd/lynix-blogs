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
  featured: boolean;
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
  sendNewsletter?: boolean;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  created_at: string;
  confirmed: boolean;
}

export interface NewsletterLog {
  id: string;
  blog_id: string;
  sent_at: string;
  recipients_count: number;
  subject: string;
  status: string;
  blogs: {
    title: string;
  };
}
