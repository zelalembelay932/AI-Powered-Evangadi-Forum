import styles from "./Navbar.module.css";

export default function Navbar({ title, subtitle, user, onLogout }) {
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "User";

  return (
    <header className={styles.navbar}>
      <div className={styles.navbar__heading}>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className={styles.navbar__user}>
        <span className={styles.avatar} aria-hidden="true">
          {displayName.slice(0, 1).toUpperCase()}
        </span>
        <span className={styles.navbar__name}>{displayName}</span>
        <button className={styles.logout} type="button" onClick={onLogout}>
          Log out
        </button>
      </div>
    </header>
  );
}
