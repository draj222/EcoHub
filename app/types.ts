export interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  content?: string;
  imageUrl?: string;
  fileUrl?: string;
  category?: string;
  tags?: string | string[];
  user: User;
  createdAt: string;
  commentsCount?: number;
  likesCount?: number;
}

export interface Comment {
  id: string;
  content: string;
  user: User;
  projectId: string;
  createdAt: string;
}

export interface Like {
  id: string;
  userId: string;
  projectId: string;
} 