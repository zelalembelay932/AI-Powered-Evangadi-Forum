import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/questions/ask", label: "Ask a Question" },
  { to: "/my-questions", label: "My Questions" },
  { to: "/rag-documents", label: "RAG Documents" },
];

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <NavLink
        className={styles.brand}
        to="/dashboard"
        aria-label="Evangadi Forum home"
      >
        <span className={styles.brand__mark}>E</span>
        <span>
          Evangadi <small>FORUM</small>
        </span>
      </NavLink>
      <nav className={styles.navigation} aria-label="Main navigation">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/dashboard"}
            className={({ isActive }) =>
              `${styles.navigation__link} ${isActive ? styles["navigation__link--active"] : ""}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
