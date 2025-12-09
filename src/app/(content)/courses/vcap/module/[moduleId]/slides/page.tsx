import SlideViewer from "./SlideViewer";

// Force static generation for known module IDs
export function generateStaticParams() {
  return [
    { moduleId: 'module1' },
    { moduleId: 'module2' },
    { moduleId: 'module3' },
  ];
}

export default function SlidesPage() {
  return <SlideViewer />;
}
