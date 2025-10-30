type Props = { active: boolean };

export default function FlashOverlay({ active }: Props) {
  return <div className={`flash-overlay ${active ? "is-active" : ""}`} aria-hidden="true" />;
}
