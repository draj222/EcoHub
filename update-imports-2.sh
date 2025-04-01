#!/bin/bash

# Find all TypeScript files
find ./app -name "*.ts" -o -name "*.tsx" | while read -r file; do
  # Replace the import statement
  sed -i '' 's|import { authOptions }|import authOptions|g' "$file"
done 