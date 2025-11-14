export function validateUrl(url: string): boolean {
  return typeof url === "string" && url.startsWith("https://www.linkedin.com/in/");
}
