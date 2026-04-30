export function resolveImageUrl(path: string | null | undefined, folder: "products" | "categories" = "products") {
  if (!path || path.trim() === "") return null;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:")) return path;
  if (path.startsWith("/")) return path;
  if (path.startsWith("uploads/")) return `/${path}`;
  return `/uploads/${folder}/${path}`;
}
