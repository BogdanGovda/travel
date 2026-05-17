import { addToFavorite } from "@/features/favorite/favoriteSlice";
import { useDispatch } from "react-redux";
import styles from "./card.module.scss";
import { CiStar } from "react-icons/ci";
import { addToCart } from "@/redux/cartSlice";
import btnBg from "@/assets/icon/btnBg.svg";
import type { Tour } from "@/shared/types";

interface Props {
  item: Tour;
}

export default function ItemCard({ item }: Props) {
  const dispatch = useDispatch();

  return (
    <div key={item.id} className={styles.card}>
      <div className={styles.item__img}>
        <img src={item.img} alt="" />
        <button
          className={styles.item__like}
          onClick={() => dispatch(addToFavorite(item))}
        >
          <CiStar />
        </button>
      </div>
      <div className={styles.text}>
        <div className="name">{item.title}</div>
        <div className="price">
          {item.promotion ? (
            <div className={styles.promo}>
              <div>Ціна: </div>
              <div className={styles.promo__price}>
                <div className={styles.promo__old}>{item.price}$</div>
                <div className={styles.promo__new}>{item.promotionPrice}$</div>
              </div>
            </div>
          ) : (
            <div>Ціна: {item.price}$</div>
          )}
        </div>
        <div className={styles.btns}>
          <button
            className={styles.btn__order}
            onClick={() => dispatch(addToCart(item))}
          >
            Замовити
            <img src={btnBg} alt="" />
          </button>
        </div>
      </div>
    </div>
  );
}
