"use client";

import { Suspense } from "react";
import Header from "@/app/components/Header";
import ForumPostForm from "@/app/components/ForumPostForm";

export default function CreatePostPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <Suspense fallback={
          <div className="flex justify-center items-center">
            <div className="animate-pulse">Loading post form...</div>
          </div>
        }>
          <ForumPostForm />
        </Suspense>
      </div>
    </div>
  );
} 