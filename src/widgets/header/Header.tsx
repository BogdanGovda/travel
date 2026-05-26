import { useCallback, useEffect, useId, useState } from "react";
import styles from "./Header.module.scss";
import HeaderMenu from "./HeaderMenu";
import logo from "@/assets/img/logo.webp";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (media.matches) closeMenu();
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [closeMenu]);

  return (
    <>
      <button
        type="button"
        className={`${styles.overlay} ${menuOpen ? styles.overlayVisible : ""}`}
        aria-label="Закрити меню"
        aria-hidden={!menuOpen}
        tabIndex={menuOpen ? 0 : -1}
        onClick={closeMenu}
      />
      <header className={menuOpen ? styles.headerOpen : undefined}>
        <div className={styles.wrapper}>
          <div className={styles.logo}>
            <img src={logo} alt="logo" />
            <button
              type="button"
              className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ""}`}
              aria-label={menuOpen ? "Закрити меню" : "Відкрити меню"}
              aria-expanded={menuOpen}
              aria-controls={menuId}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
          <HeaderMenu
            id={menuId}
            isOpen={menuOpen}
            onClose={closeMenu}
          />
        </div>
      </header>
    </>
  );
}

export default Header;
