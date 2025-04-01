#!/bin/bash

# Find all TypeScript files
find ./app -type f -name "*.ts" -o -name "*.tsx" | while read -r file; do
  # Skip the auth.ts file itself
  if [[ "$file" != "./app/lib/auth.ts" ]]; then
    # Replace default imports with named imports
    sed -i '' -E 's/import[[:space:]]+authOptions[[:space:]]+from/import { authOptions } from/g' "$file"
    # Replace imports from route file with imports from auth.ts
    sed -i '' -E 's/from[[:space:]]+"@\/app\/api\/auth\/\[\.\.\.nextauth\]\/route"/from "@\/app\/lib\/auth"/g' "$file"
  fi
done 