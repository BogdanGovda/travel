import { useContext, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import styles from "./Cart.module.scss";
import btnBg from "@/assets/icon/btnBg.svg";
import { MdDelete } from "react-icons/md";
import {
  addToCart,
  removeAllFromCart,
  removeFromCart,
} from "@/features/cart/cartSlice";
import type { RootState } from "@/store/store";

function CartPage() {
  const dispatch = useDispatch();

  const cart = useSelector((state: RootState) => state.cart);

  const totalPrice = useMemo(() => {
    return cart.reduce((sum, el) => sum + el.item.price * el.count, 0);
  }, [cart]);

  const itemList = useMemo(() => {
    return cart.map(({ item, count }) => (
      <div className={styles.item} key={item.id} style={{ display: "flex" }}>
        <div className={styles.item__img}>
          <img src={item.img} alt="" />
        </div>
        <div className={styles.info}>
          <div className="item__name">{item.title}</div>
          <div className="item__price">{item.price * count}$</div>

          <div className={styles.count}>
            <button onClick={() => dispatch(addToCart(item))}>+</button>
            <div className="item__count">{count}</div>
            <button
              disabled={count === 1}
              onClick={() => dispatch(removeFromCart(item.id))}
            >
              -
            </button>
          </div>
          <button onClick={() => dispatch(removeAllFromCart(item.id))}>
            <MdDelete />
          </button>
        </div>
      </div>
    ));
  }, [cart]);

  return (
    <section className="cart">
      <div className={styles.wrapper}>
        <h1>Кошик</h1>
        <div className={styles.content}>
          <div className={styles.list}>
            {cart.length > 0 ? itemList : <h3>Кошик пустий</h3>}
          </div>
          {cart.length > 0 ? (
            <div className={styles.ofer}>
              <h2>Ваших товарів</h2>
              <h3>На суму: {totalPrice} $</h3>
              <button className={styles.btn__ofer}>
                оплатити
                <img src={btnBg} alt="" />
              </button>
            </div>
          ) : (
            <Link to="/">Добавте товар у кошик</Link>
          )}
        </div>
      </div>
    </section>
  );
}
export default CartPage;
