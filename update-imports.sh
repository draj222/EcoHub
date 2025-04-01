#!/bin/bash

# Find all TypeScript files
find ./app -name "*.ts" -o -name "*.tsx" | while read -r file; do
  # Replace the import statement
  sed -i '' 's|from "@/app/api/auth/\[...nextauth\]/route"|from "@/app/lib/auth"|g' "$file"
  sed -i '' 's|from "../auth/\[...nextauth\]/route"|from "@/app/lib/auth"|g' "$file"
  sed -i '' 's|from "../../auth/\[...nextauth\]/route"|from "@/app/lib/auth"|g' "$file"
  sed -i '' 's|from "../../../auth/\[...nextauth\]/route"|from "@/app/lib/auth"|g' "$file"
done 