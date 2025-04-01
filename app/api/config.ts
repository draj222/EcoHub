// Common configuration for API routes
export const dynamic = 'force-dynamic';

// Helper for error responses
export function errorResponse(message: string, status: number = 500) {
  return Response.json({ error: message }, { status });
}

// Helper for successful responses
export function successResponse(data: any, status: number = 200) {
  return Response.json(data, { status });
}

// Helper to safely parse search params 
export function getQueryParam(url: URL, name: string): string | null {
  return url.searchParams.get(name);
}

// Helper to get required query parameter or return error
export function getRequiredQueryParam(url: URL, name: string): { value: string } | { error: Response } {
  const value = url.searchParams.get(name);
  if (!value) {
    return { error: errorResponse(`${name} is required`, 400) };
  }
  return { value };
}

// Helper to safely parse page and limit params
export function getPaginationParams(url: URL): { page: number, limit: number } {
  const pageParam = url.searchParams.get("page") || "1";
  const limitParam = url.searchParams.get("limit") || "10";
  
  const page = parseInt(pageParam, 10);
  const limit = parseInt(limitParam, 10);
  
  return {
    page: isNaN(page) ? 1 : Math.max(1, page),
    limit: isNaN(limit) ? 10 : Math.min(100, Math.max(1, limit))
  };
} 