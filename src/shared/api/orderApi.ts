import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDocs, query, where } from "firebase/firestore";
import { auth } from "@/firebase";
import { db } from "@/firebase";
import type { CartItem } from "../types";

export const createOrder = async (cart: CartItem[], totalPrice: number) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    const order = {
      userId: user.uid,
      userEmail: user.email,

      items: cart,

      totalPrice,

      status: "pending",

      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, "orders"), order);
  } catch (error) {
    console.log(error);

    throw error;
  }
};
export const getUserOrders = async () => {
  const user = auth.currentUser;

  if (!user) return [];

  const q = query(collection(db, "orders"), where("userId", "==", user.uid));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};
