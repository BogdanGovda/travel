import { Link } from "react-router-dom";
import styles from "./Header.module.scss";
import { MdOutlineShoppingCart, MdLocalPhone, MdEmail } from "react-icons/md";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import FavoriteModal from "../favorite/favoriteModal";
function HeaderTopBar() {
  const cart = useSelector((state: RootState) => state.cart);

  return (
    <>
      <div className={styles.topBar}>
        <div className={styles.list}>
          <Link to="#">Страховки</Link>
          <Link to="#">Візи</Link>
          <Link to="#">Контакти</Link>
          <Link to="#">
            <MdLocalPhone />
            +380 63 234 0745
          </Link>
          <Link to="#">
            <MdEmail />
            contact@email.ee
          </Link>
          <Link to="#" className="login"></Link>

          <Link to="/cart">
            <MdOutlineShoppingCart /> {cart.length}
          </Link>
          <FavoriteModal></FavoriteModal>
        </div>
      </div>
    </>
  );
}

export default HeaderTopBar;
