export interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  fileUrl?: string | null;
  category?: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user?: User;
  commentsCount?: number;
  likesCount?: number;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  projectId: string;
  user: User;
}

export interface Like {
  id: string;
  createdAt: Date;
  userId: string;
  projectId: string;
}