import { getUserOrders } from "@/shared/api/orderApi";
import { getOrderStatusLabel } from "@/shared/orderStatus";
import type { CartItem } from "@/shared/types";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Profile.module.scss";
import AdminPage from "../AdminPage/AdminPage";

const ADMIN_TAB_INDEX = 2;

const checkIsAdmin = async (uid: string): Promise<boolean> => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.data()?.isAdmin === true;
};

type UserOrder = {
  id: string;
  totalPrice?: number;
  status?: string;
  items?: CartItem[];
};

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
  const [ordersError, setOrdersError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setAdminLoading(false);
      return;
    }

    let cancelled = false;
    setAdminLoading(true);

    checkIsAdmin(user.uid)
      .then((admin) => {
        if (!cancelled) {
          setIsAdmin(admin);
        }
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) {
          setIsAdmin(false);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setAdminLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!isAdmin && activeTab === ADMIN_TAB_INDEX) {
      setActiveTab(0);
    }
  }, [isAdmin, activeTab]);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setOrdersError("");
      return;
    }

    let cancelled = false;
    setOrdersLoading(true);
    setOrdersError("");

    getUserOrders()
      .then((data) => {
        if (!cancelled) {
          setOrders(data as UserOrder[]);
        }
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) {
          setOrdersError("Не вдалося завантажити замовлення.");
        }
      })
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
    { id: "orders", label: "Мої замовлення" },
    { id: "profile", label: "Мій профіль" },
    ...(isAdmin ? [{ id: "admin", label: "Панель" }] : []),
  ] as const;

  return (
    <div className={styles.wrapper}>
      <div className={styles.tabs} role="tablist" aria-label="Профіль">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
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
          ) : ordersError ? (
            <p className={styles.error}>{ordersError}</p>
          ) : orders.length === 0 ? (
            <p className={styles.message}>У вас ще немає замовлень.</p>
          ) : (
            <ul className={styles.orders}>
              {orders.map((order) => (
                <li key={order.id} className={styles.orders__item}>
                  <div className={styles.orders__meta}>
                    <span>№ {order.id.slice(0, 8)}</span>
                    <span>{getOrderStatusLabel(order.status)}</span>
                    <span>{order.totalPrice ?? 0} ₴</span>
                  </div>
                  {(order.items ?? []).length > 0 && (
                    <ul className={styles.orders__products}>
                      {(order.items ?? []).map((line, index) => (
                        <li
                          key={`${order.id}-${line.item?.id ?? index}`}
                          className={styles.orders__product}
                        >
                          <span>{line.item?.title ?? "Товар"}</span>
                          <span>x{line.count}</span>
                          <span>
                            {line.item?.promotion
                              ? (line.item.promotionPrice ?? 0)
                              : (line.item?.price ?? 0)}{" "}
                            ₴
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
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
            onClick={() => void handleLogout()}
          >
            Вийти
          </button>
        </TabPanel>

        {isAdmin && !adminLoading && (
          <TabPanel value={activeTab} index={ADMIN_TAB_INDEX}>
            <AdminPage />
          </TabPanel>
        )}
      </div>
    </div>
  );
}
