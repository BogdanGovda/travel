import { CustomSwiper } from "@/shared/ui/swiper/Swiper";
import { SwiperSlide } from "swiper/react";
import styles from "./TourList.module.scss";
import type { Tour } from "@/shared/api/types";
import { useDispatch } from "react-redux";
import { addToCart } from "@/redux/cartSlice";
import { CiStar } from "react-icons/ci";
import { addToFavorite } from "@/features/favorite/favoriteSlice";
import btnBg from "@/assets/icon/btnBg.svg";
import ItemCard from "@/components/card/itemCard";
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
          <SwiperSlide>
            <ItemCard item={item}></ItemCard>
          </SwiperSlide>
        ))}
      </CustomSwiper>
    </div>
  );
}
export default TourList;
