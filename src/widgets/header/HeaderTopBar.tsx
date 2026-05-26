import { Link } from "react-router-dom";
import styles from "./Header.module.scss";
import {
  MdOutlineShoppingCart,
  MdLocalPhone,
  MdEmail,
} from "react-icons/md";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import FavoriteModal from "../favorite/favoriteModal";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/firebase";

type HeaderTopBarProps = {
  onClose: () => void;
};

function HeaderTopBar({ onClose }: HeaderTopBarProps) {
  const cart = useSelector((state: RootState) => state.cart);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  return (
    <div className={styles.topBar}>
      <div className={styles.list}>
        <Link to="#" onClick={onClose}>
          Страховки
        </Link>
        <Link to="#" onClick={onClose}>
          Візи
        </Link>
        <Link to="#" onClick={onClose}>
          Контакти
        </Link>
        <Link to="#" onClick={onClose}>
          <MdLocalPhone />
          +380 63 234 0745
        </Link>
        <Link to="#" onClick={onClose}>
          <MdEmail />
          contact@email.ee
        </Link>
        <Link to="#" className="login" onClick={onClose} />

        <Link to="/cart" onClick={onClose}>
          <MdOutlineShoppingCart /> {cart.length}
        </Link>
        <div>
          {user ? (
            <Link to="/profile" onClick={onClose}>
              Профіль
            </Link>
          ) : (
            <Link to="/auth" onClick={onClose}>
              Логін
            </Link>
          )}
        </div>
        <FavoriteModal />
      </div>
    </div>
  );
}

export default HeaderTopBar;
