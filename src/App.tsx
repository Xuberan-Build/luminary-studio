import { Outlet } from "react-router-dom";
import Nav from "./components/Nav";

export default function App() {
  return (
    <div style={{ minHeight: "100dvh", background: "#0b000f", color: "#B399FF", fontFamily: "system-ui, sans-serif" }}>
      <Nav />
      <Outlet />
    </div>
  );
}
