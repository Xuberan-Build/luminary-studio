import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import styles from "./glossary-entry.module.css";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function getGlossaryEntries() {
  const glossaryDir = path.join(process.cwd(), "src/content/glossary");
  if (!fs.existsSync(glossaryDir)) {
    return [];
  }

  const files = fs.readdirSync(glossaryDir).filter((file) => file.endsWith(".mdx"));
  return files.map((file) => ({
    slug: file.replace(".mdx", ""),
    filePath: path.join(glossaryDir, file),
  }));
}

export async function generateStaticParams() {
  return getGlossaryEntries().map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const entry = getGlossaryEntries().find((item) => item.slug === slug);

  if (!entry || !fs.existsSync(entry.filePath)) {
    return { title: "Not Found" };
  }

  const fileContent = fs.readFileSync(entry.filePath, "utf-8");
  const { data } = matter(fileContent);

  return {
    title: `${data.title} | Quantum Glossary`,
    description: data.description,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function GlossaryEntryPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = getGlossaryEntries().find((item) => item.slug === slug);

  if (!entry || !fs.existsSync(entry.filePath)) {
    notFound();
  }

  const fileContent = fs.readFileSync(entry.filePath, "utf-8");
  const { data, content } = matter(fileContent);

  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Quantum Glossary</p>
        <h1 className={styles.title}>{data.title}</h1>
        {data.description && <p className={styles.description}>{data.description}</p>}
      </header>

      <div className={`article-prose ${styles.prose}`}>
        <MDXRemote source={content} />
      </div>
    </article>
  );
}
