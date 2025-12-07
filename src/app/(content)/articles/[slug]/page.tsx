import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";

type PageProps = {
  params: Promise<{ slug: string }>;
};

// Get all articles from all categories
function getAllArticles() {
  const articlesDir = path.join(process.cwd(), "src/content/articles");
  const categories = ["customer-acquisition", "operations", "product-development"];

  const articles: { slug: string; category: string; filePath: string }[] = [];

  categories.forEach((category) => {
    const categoryDir = path.join(articlesDir, category);
    if (fs.existsSync(categoryDir)) {
      const files = fs.readdirSync(categoryDir).filter((file) => file.endsWith(".mdx"));
      files.forEach((file) => {
        articles.push({
          slug: file.replace(".mdx", ""),
          category,
          filePath: path.join(categoryDir, file)
        });
      });
    }
  });

  return articles;
}

// Generate static params for all articles
export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

// Generate metadata
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const articles = getAllArticles();
  const article = articles.find((a) => a.slug === slug);

  if (!article || !fs.existsSync(article.filePath)) {
    return {
      title: "Not Found",
    };
  }

  const fileContent = fs.readFileSync(article.filePath, "utf-8");
  const { data } = matter(fileContent);

  return {
    title: `${data.title} | Quantum Strategies`,
    description: data.description,
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const articles = getAllArticles();
  const article = articles.find((a) => a.slug === slug);

  if (!article || !fs.existsSync(article.filePath)) {
    notFound();
  }

  const fileContent = fs.readFileSync(article.filePath, "utf-8");
  const { data, content } = matter(fileContent);

  return (
    <article className="container" style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1rem" }}>
      <header style={{ marginBottom: "2rem" }}>
        {data.category && (
          <div style={{
            color: "var(--accent)",
            fontSize: "0.875rem",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "0.5rem"
          }}>
            {data.category}
          </div>
        )}
        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem", color: "#fff" }}>
          {data.title}
        </h1>
        {data.description && (
          <p style={{ fontSize: "1.25rem", color: "var(--ink-soft)", marginBottom: "1rem" }}>
            {data.description}
          </p>
        )}
        {data.date && (
          <time style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>
            {new Date(data.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        )}
      </header>

      <div className="prose" style={{ color: "var(--ink-soft)", lineHeight: "1.8" }}>
        <MDXRemote source={content} />
      </div>
    </article>
  );
}
