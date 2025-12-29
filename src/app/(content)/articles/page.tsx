import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";

interface Article {
  slug: string;
  category: string;
  title: string;
  description: string;
  date: string;
}

function getAllArticles(): Article[] {
  const articlesDir = path.join(process.cwd(), "src/content/articles");
  const categories = ["customer-acquisition", "operations", "product-development", "waveforms"];

  const articles: Article[] = [];

  categories.forEach((category) => {
    const categoryDir = path.join(articlesDir, category);
    if (fs.existsSync(categoryDir)) {
      const files = fs.readdirSync(categoryDir).filter((file) => file.endsWith(".mdx"));
      files.forEach((file) => {
        const filePath = path.join(categoryDir, file);
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const { data } = matter(fileContent);

        articles.push({
          slug: file.replace(".mdx", ""),
          category: category.replace(/-/g, " "),
          title: data.title || file.replace(".mdx", ""),
          description: data.description || "",
          date: data.date || ""
        });
      });
    }
  });

  // Sort by date (newest first)
  return articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const metadata = {
  title: "Articles | Quantum Strategies",
  description: "Strategic insights on customer acquisition, product development, and operations. Proven frameworks and actionable tactics for business growth."
};

export default function ArticlesPage() {
  const articles = getAllArticles();

  const categorizedArticles = {
    "customer acquisition": articles.filter(a => a.category === "customer acquisition"),
    "operations": articles.filter(a => a.category === "operations"),
    "product development": articles.filter(a => a.category === "product development"),
    "waveforms series": articles.filter(a => a.category === "waveforms")
  };

  return (
    <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "4rem 1rem" }}>
      <header style={{ marginBottom: "3rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "1rem", color: "#fff" }}>
          Strategic Articles
        </h1>
        <p style={{ fontSize: "1.25rem", color: "var(--ink-soft)", maxWidth: "600px", margin: "0 auto" }}>
          Proven frameworks and actionable tactics for scaling your business
        </p>
      </header>

      {Object.entries(categorizedArticles).map(([category, categoryArticles]) => (
        categoryArticles.length > 0 && (
          <section key={category} style={{ marginBottom: "4rem" }}>
            <h2 style={{
              fontSize: "1.75rem",
              marginBottom: "2rem",
              color: "#fff",
              textTransform: "capitalize",
              borderBottom: "2px solid var(--accent)",
              paddingBottom: "0.5rem"
            }}>
              {category}
            </h2>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "2rem"
            }}>
              {categoryArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}`}
                  style={{
                    display: "block",
                    padding: "1.5rem",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    transition: "all 0.2s",
                    textDecoration: "none"
                  }}
                  className="article-card"
                >
                  <h3 style={{ fontSize: "1.25rem", marginBottom: "0.75rem", color: "#fff" }}>
                    {article.title}
                  </h3>
                  <p style={{ color: "var(--ink-soft)", fontSize: "0.95rem", lineHeight: "1.6" }}>
                    {article.description}
                  </p>
                  {article.date && (
                    <time style={{ display: "block", marginTop: "1rem", color: "var(--accent)", fontSize: "0.875rem" }}>
                      {new Date(article.date).getFullYear()}
                    </time>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )
      ))}
    </div>
  );
}
