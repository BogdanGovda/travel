import styles from "./Header.module.scss";
import { Link } from "react-router-dom";
import HeaderTopBar from "./HeaderTopBar";

function HeaderMenu() {
  return (
    <>
      <nav>
        <HeaderTopBar></HeaderTopBar>
        <div className={styles.list}>
          <Link to="/" className={styles.link}>
            Товари
          </Link>
          <Link to="/about" className={styles.link}>
            Каталог
          </Link>
        </div>
      </nav>
    </>
  );
}

export default HeaderMenu;
