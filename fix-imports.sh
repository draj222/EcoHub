#!/bin/bash

# Find all TypeScript files
find ./app -name "*.ts" -o -name "*.tsx" | while read -r file; do
  # Skip the auth.ts file itself
  if [[ "$file" != "./app/lib/auth.ts" ]]; then
    # Replace any import of authOptions to use named import from the new location
    sed -i '' -E 's|import[[:space:]]+authOptions[[:space:]]+from[[:space:]]+"([^"]+)"|import { authOptions } from "@/app/lib/auth"|g' "$file"
    sed -i '' -E 's|import[[:space:]]+{[[:space:]]*authOptions[[:space:]]*}[[:space:]]+from[[:space:]]+"([^"]+)"|import { authOptions } from "@/app/lib/auth"|g' "$file"
    
    # Replace any relative imports
    sed -i '' 's|from "../auth/\[...nextauth\]/route"|from "@/app/lib/auth"|g' "$file"
    sed -i '' 's|from "../../auth/\[...nextauth\]/route"|from "@/app/lib/auth"|g' "$file"
    sed -i '' 's|from "../../../auth/\[...nextauth\]/route"|from "@/app/lib/auth"|g' "$file"
    sed -i '' 's|from "@/app/api/auth/\[...nextauth\]/route"|from "@/app/lib/auth"|g' "$file"
  fi
done 