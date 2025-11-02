import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";

type PageProps = {
  params: Promise<{ slug: string }>;
};

// Generate static params for all MDX files
export async function generateStaticParams() {
  const contentDir = path.join(process.cwd(), "src/content/resources/customer-acquisition");
  
  // Check if directory exists
  if (!fs.existsSync(contentDir)) {
    return [];
  }
  
  const files = fs.readdirSync(contentDir).filter((file) => file.endsWith(".mdx"));
  
  return files.map((file) => ({
    slug: file.replace(".mdx", ""),
  }));
}

// Generate metadata
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const filePath = path.join(
    process.cwd(),
    "src/content/resources/customer-acquisition",
    `${slug}.mdx`
  );

  if (!fs.existsSync(filePath)) {
    return {
      title: "Not Found",
    };
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data } = matter(fileContent);

  return {
    title: data.title,
    description: data.description,
  };
}

export default async function CustomerAcquisitionArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const filePath = path.join(
    process.cwd(),
    "src/content/resources/customer-acquisition",
    `${slug}.mdx`
  );

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);

  return (
    <article className="container" style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1rem" }}>
      <header style={{ marginBottom: "2rem" }}>
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
