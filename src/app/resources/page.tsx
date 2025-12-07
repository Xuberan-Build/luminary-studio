import Link from "next/link";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export const metadata = {
  title: "Resources | Quantum Strategies",
  description: "Strategic frameworks, courses, and insights to accelerate your business growth. Articles, white papers, and actionable courses."
};

function getFeaturedArticles() {
  const articlesDir = path.join(process.cwd(), "src/content/articles");
  const categories = ["customer-acquisition", "operations", "product-development"];

  const articles: any[] = [];

  categories.forEach((category) => {
    const categoryDir = path.join(articlesDir, category);
    if (fs.existsSync(categoryDir)) {
      const files = fs.readdirSync(categoryDir).filter((file) => file.endsWith(".mdx"));

      // Get first 2 articles from each category
      files.slice(0, 2).forEach((file) => {
        const filePath = path.join(categoryDir, file);
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const { data } = matter(fileContent);

        articles.push({
          slug: file.replace(".mdx", ""),
          category: category.replace(/-/g, " "),
          title: data.title || file.replace(".mdx", ""),
          description: data.description || ""
        });
      });
    }
  });

  return articles;
}

export default function ResourcesHub() {
  const featuredArticles = getFeaturedArticles();

  const contentTypes = [
    {
      title: "Articles",
      description: "In-depth guides on customer acquisition, product development, and operations",
      href: "/articles",
      icon: "📚",
      count: `${featuredArticles.length}+ articles`
    },
    {
      title: "Courses",
      description: "Structured learning experiences with interactive content and proven frameworks",
      href: "/courses",
      icon: "🎓",
      count: "Coming soon"
    },
    {
      title: "White Papers",
      description: "Comprehensive research and strategic frameworks for business growth",
      href: "/whitepapers",
      icon: "📄",
      count: "Coming soon"
    },
    {
      title: "Blog",
      description: "Insights, updates, and thought leadership on digital strategy",
      href: "/blog",
      icon: "✍️",
      count: "Latest posts"
    }
  ];

  return (
    <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "4rem 1rem" }}>
      {/* Header */}
      <header style={{ marginBottom: "4rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "3.5rem", marginBottom: "1rem", color: "#fff" }}>
          Resources Hub
        </h1>
        <p style={{ fontSize: "1.5rem", color: "var(--ink-soft)", maxWidth: "700px", margin: "0 auto" }}>
          Strategic frameworks and actionable insights to accelerate your business growth
        </p>
      </header>

      {/* Content Types Grid */}
      <section style={{ marginBottom: "5rem" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "2rem", color: "#fff" }}>
          Browse by Type
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "2rem"
        }}>
          {contentTypes.map((type) => (
            <Link
              key={type.title}
              href={type.href}
              style={{
                display: "block",
                padding: "2rem",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                transition: "all 0.3s",
                textDecoration: "none"
              }}
              className="resource-card"
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{type.icon}</div>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "0.75rem", color: "#fff" }}>
                {type.title}
              </h3>
              <p style={{ color: "var(--ink-soft)", marginBottom: "1rem", lineHeight: "1.6" }}>
                {type.description}
              </p>
              <div style={{ color: "var(--accent)", fontSize: "0.875rem", fontWeight: "600" }}>
                {type.count} →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Articles */}
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "2rem", color: "#fff" }}>
            Featured Articles
          </h2>
          <Link
            href="/articles"
            style={{ color: "var(--accent)", textDecoration: "none", fontWeight: "600" }}
          >
            View all articles →
          </Link>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "2rem"
        }}>
          {featuredArticles.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              style={{
                display: "block",
                padding: "1.5rem",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                transition: "all 0.2s",
                textDecoration: "none"
              }}
              className="article-card"
            >
              <div style={{
                color: "var(--accent)",
                fontSize: "0.75rem",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "0.75rem"
              }}>
                {article.category}
              </div>
              <h3 style={{ fontSize: "1.25rem", marginBottom: "0.75rem", color: "#fff" }}>
                {article.title}
              </h3>
              <p style={{ color: "var(--ink-soft)", fontSize: "0.95rem", lineHeight: "1.6" }}>
                {article.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        marginTop: "5rem",
        padding: "3rem",
        backgroundColor: "rgba(var(--accent-rgb), 0.1)",
        borderRadius: "12px",
        border: "1px solid rgba(var(--accent-rgb), 0.2)",
        textAlign: "center"
      }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "1rem", color: "#fff" }}>
          Ready to Transform Your Business?
        </h2>
        <p style={{ fontSize: "1.125rem", color: "var(--ink-soft)", marginBottom: "2rem", maxWidth: "600px", margin: "0 auto 2rem" }}>
          Get personalized strategic consulting to accelerate your growth
        </p>
        <Link
          href="/contact"
          style={{
            display: "inline-block",
            padding: "1rem 2rem",
            backgroundColor: "var(--accent)",
            color: "#fff",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "600",
            transition: "all 0.2s"
          }}
        >
          Let's Talk Strategy →
        </Link>
      </section>

    </div>
  );
}
