import { CustomSwiper } from "@/shared/ui/swiper/Swiper";
import { SwiperSlide } from "swiper/react";
import styles from "./TourList.module.scss";
import type { Tour } from "@/shared/api/types";
import { useDispatch } from "react-redux";
import { addToCart } from "@/redux/cartSlice";
import { CiStar } from "react-icons/ci";
import { addToFavorite } from "@/features/favorite/favoriteSlice";
import btnBg from "@/assets/icon/btnBg.svg";
interface Props {
  tours: Tour[];
}

function TourList({ tours }: Props) {
  const dispatch = useDispatch();

  return (
    <div className={styles.wrapper}>
      <CustomSwiper
        navigation
        pagination={{ clickable: true }}
        className={styles.slider}
      >
        {tours.map((item) => (
          <SwiperSlide key={item.id} className={styles.card}>
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
              <div className="price">Ціна: {item.price}$</div>
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
          </SwiperSlide>
        ))}
      </CustomSwiper>
    </div>
  );
}
export default TourList;
