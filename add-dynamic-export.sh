#!/bin/bash

# Get all route files in the API directory
API_ROUTES=$(find ./app/api -name "route.ts")

# Loop through each file and add the dynamic export if it doesn't exist
for file in $API_ROUTES; do
  # Check if the file already has the dynamic export
  if ! grep -q "export const dynamic" "$file"; then
    # Add the dynamic export after the imports
    awk '
      BEGIN { added = 0 }
      /^import/ { print; next }
      !added && NF > 0 && !/^import/ {
        print "export const dynamic = '\''force-dynamic'\'';\n";
        added = 1;
      }
      { print }
    ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    echo "Added dynamic export to $file"
  else
    echo "Dynamic export already exists in $file"
  fi
done

echo "All API routes updated successfully!" 