import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import styles from "./article.module.css";

type PageProps = {
  params: Promise<{ slug: string }>;
};

// Get all articles from all categories
function getAllArticles() {
  const articlesDir = path.join(process.cwd(), "src/content/articles");
  const categories = ["customer-acquisition", "operations", "product-development", "waveforms"];

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
    <article className={styles.article}>
      <header className={styles.header}>
        {data.category && <div className={styles.category}>{data.category}</div>}
        <h1 className={styles.title}>{data.title}</h1>
        {data.description && <p className={styles.description}>{data.description}</p>}
        {data.date && (
          <time className={styles.date}>{new Date(data.date).getFullYear()}</time>
        )}
      </header>

      <div className={`article-prose ${styles.prose}`}>
        <MDXRemote source={content} />
      </div>
    </article>
  );
}
