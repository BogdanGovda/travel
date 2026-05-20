import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage/HomePage";
import AboutPage from "../pages/AboutPage/AboutPage";
import CartPage from "../pages/Cart/CartPage";
import OrderPage from "@/pages/OrderPage/OrderPage";
import AuthPage from "@/pages/Profile/AuthPage";
import ProfilePage from "@/pages/Profile/Profile";

const MainRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/order" element={<OrderPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
};

export default MainRouter;
