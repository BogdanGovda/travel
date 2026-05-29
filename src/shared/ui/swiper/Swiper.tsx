import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { ReactNode } from "react";
import { Swiper } from "swiper/react";
import type { SwiperProps } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

interface MySwiperProps extends SwiperProps {
  children: ReactNode;
}

export const CustomSwiper = ({ children, ...props }: MySwiperProps) => {
  return (
    <Swiper
      modules={[Navigation, Autoplay]}
      loop={true}
      breakpoints={{
        0: {
          slidesPerView: 1,
          spaceBetween: 16,
        },
        515: {
          slidesPerView: 2,
          spaceBetween: 24,
        },
        768: {
          slidesPerView: 3,
          spaceBetween: 40,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 80,
        },
      }}
      {...props}
    >
      {children}
    </Swiper>
  );
};
