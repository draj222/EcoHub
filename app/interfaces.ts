export interface Project {
  id: string;
  title: string;
  description: string;
  content?: string;
  imageUrl?: string;
  fileUrl?: string;
  category?: string;
  tags: string[] | string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  createdAt: string;
  updatedAt: string;
  commentsCount?: number;
  likesCount?: number;
  type?: 'project';
}

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  bio?: string | null;
  createdAt: string;
  _count?: {
    projects: number;
    followers: number;
    following: number;
  };
}

export interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  type: 'post';
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  topic: {
    id: string;
    name: string;
    slug: string;
    category: string;
  };
  commentsCount: number;
  likesCount: number;
}

export type FeedItem = Project | Post; 