import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Custom heading components with anchor links support
    h1: ({ children, ...props }) => (
      <h1 {...props}>{children}</h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 {...props}>{children}</h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 {...props}>{children}</h3>
    ),
    // Enhanced code blocks
    code: ({ children, ...props }) => (
      <code {...props}>{children}</code>
    ),
    // Custom links with external indicators
    a: ({ href, children, ...props }) => (
      <a
        href={href}
        {...props}
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    ),
    ...components,
  };
}
