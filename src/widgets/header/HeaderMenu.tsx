import styles from "./Header.module.scss";
import { Link } from "react-router-dom";
import HeaderTopBar from "./HeaderTopBar";

type HeaderMenuProps = {
  id: string;
  isOpen: boolean;
  onClose: () => void;
};

function HeaderMenu({ id, isOpen, onClose }: HeaderMenuProps) {
  return (
    <nav
      id={id}
      className={`${styles.menu} ${isOpen ? styles.menuOpen : ""}`}
      aria-hidden={!isOpen}
    >
      <HeaderTopBar onClose={onClose} />
      <div className={styles.list}>
        <Link to="/" className={styles.link} onClick={onClose}>
          Товари
        </Link>
        <Link to="/about" className={styles.link} onClick={onClose}>
          Каталог
        </Link>
      </div>
    </nav>
  );
}

export default HeaderMenu;
