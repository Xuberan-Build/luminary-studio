import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 ${isActive ? "font-semibold underline" : ""}`;

export default function Nav() {
  return (
    <nav aria-label="Main navigation" style={{ padding: "1rem", borderBottom: "1px solid #333" }}>
      <ul style={{ display: "flex", gap: "1rem", listStyle: "none", margin: 0, padding: 0 }}>
        <li><NavLink className={linkClass} to="/">Home</NavLink></li>
        <li><NavLink className={linkClass} to="/meet">Meet</NavLink></li>
      </ul>
    </nav>
  );
}
