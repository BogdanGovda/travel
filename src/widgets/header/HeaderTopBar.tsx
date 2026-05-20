import { Link } from "react-router-dom";
import styles from "./Header.module.scss";
import { MdOutlineShoppingCart, MdLocalPhone, MdEmail } from "react-icons/md";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import FavoriteModal from "../favorite/favoriteModal";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/firebase";
function HeaderTopBar() {
  const cart = useSelector((state: RootState) => state.cart);

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);
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
          <div>
            {user ? (
              <Link to="/profile">Профіль</Link>
            ) : (
              <Link to="/auth">Логін</Link>
            )}
          </div>
          <FavoriteModal></FavoriteModal>
        </div>
      </div>
    </>
  );
}

export default HeaderTopBar;
