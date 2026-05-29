import { getUserOrders } from "@/shared/api/orderApi";
import type { CartItem } from "@/shared/types";
import { auth } from "@/firebase";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Profile.module.scss";
import { MdLabel } from "react-icons/md";
import AdminPage from "../AdminPage/AdminPage";

type UserOrder = {
  id: string;
  totalPrice?: number;
  status?: string;
  items?: CartItem[];
};
const isAdmin = true;
interface TabPanelProps {
  children: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  if (value !== index) return null;

  return (
    <div
      role="tabpanel"
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      className={styles.content__panel}
    >
      {children}
    </div>
  );
}

function tabA11yProps(index: number) {
  return {
    id: `profile-tab-${index}`,
    "aria-controls": `profile-tabpanel-${index}`,
  };
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }

    let cancelled = false;
    setOrdersLoading(true);

    getUserOrders()
      .then((data) => {
        if (!cancelled) {
          setOrders(data as UserOrder[]);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) {
          setOrdersLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.message}>
          Увійдіть у акаунт, щоб переглянути профіль.{" "}
          <Link to="/auth">Увійти</Link>
        </p>
      </div>
    );
  }

  const tabs = [
    { label: "Мої замовлення" },
    { label: "Мій профіль" },
    ...(isAdmin ? [{ label: "Панель" }] : []),
  ] as const;

  return (
    <div className={styles.wrapper}>
      <div className={styles.tabs} role="tablist" aria-label="Профіль">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            type="button"
            role="tab"
            className={`${styles.tabs__item} ${
              activeTab === index ? styles.tabs__item_active : ""
            }`}
            onClick={() => setActiveTab(index)}
            {...tabA11yProps(index)}
            aria-selected={activeTab === index}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        <TabPanel value={activeTab} index={0}>
          {ordersLoading ? (
            <p className={styles.message}>Завантаження замовлень…</p>
          ) : orders.length === 0 ? (
            <p className={styles.message}>У вас ще немає замовлень.</p>
          ) : (
            <ul className={styles.orders}>
              {orders.map((order) => (
                <li key={order.id} className={styles.orders__item}>
                  <span>№ {order.id.slice(0, 8)}</span>
                  <span>{order.status ?? "pending"}</span>
                  <span>{order.totalPrice ?? 0} ₴</span>
                </li>
              ))}
            </ul>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <dl className={styles.profile}>
            <dt>Email</dt>
            <dd>{user.email ?? "—"}</dd>
          </dl>
          <button
            type="button"
            className={styles.logoutBtn}
            onClick={handleLogout}
          >
            Вийти
          </button>
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <AdminPage></AdminPage>
        </TabPanel>
      </div>
    </div>
  );
}
