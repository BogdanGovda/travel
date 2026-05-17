import type { Tour } from "./types";
import homeFlower1 from "@/assets/img/home/homeFlower1.webp";
import homeFlower2 from "@/assets/img/home/homeFlower2.webp";
import homeFlower3 from "@/assets/img/home/homeSlide2.webp";
import homeFlower4 from "@/assets/img/home/homeSlide1.webp";
import { collection, getDocs, type DocumentData } from "firebase/firestore";
import type { QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

const MOCK_TOURS: Tour[] = [
  {
    id: 1,
    title: "Карпати",
    img: homeFlower1,
    price: 50,
    promotion: true,
    promotionPrice: 25,
  },
  { id: 2, title: "Єгипет", img: homeFlower2, price: 100, promotion: false },
  { id: 3, title: "Карпати", img: homeFlower3, price: 120, promotion: false },
  { id: 4, title: "Торонто", img: homeFlower4, price: 140, promotion: false },
];

type TourFirestore = {
  id?: number;
  title?: string;
  img?: string;
  price?: number;
  promotion?: boolean;
  promotionPrice?: number;
};

const mapDocToTour = (
  doc: QueryDocumentSnapshot<DocumentData>,
  index: number,
): Tour => {
  const data = doc.data() as TourFirestore;
  const promotion = Boolean(data.promotion);

  return {
    id: typeof data.id === "number" ? data.id : index + 1,
    title: String(data.title ?? ""),
    img: String(data.img ?? ""),
    price: Number(data.price ?? 0),
    promotion,
    ...(promotion && { promotionPrice: Number(data.promotionPrice ?? 0) }),
  };
};

export const getTours = async (): Promise<Tour[]> => {
  try {
    const snapshot = await getDocs(collection(db, "itemList"));
    if (snapshot.empty) return MOCK_TOURS;

    return snapshot.docs.map(mapDocToTour);
  } catch (error) {
    console.error("Failed to fetch tours from Firestore:", error);
    return MOCK_TOURS;
  }
};
