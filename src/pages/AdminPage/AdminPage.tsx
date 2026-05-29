import { useEffect, useState } from "react";
import styles from "./AdminPage.module.scss";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import type { CartItem, Tour } from "@/shared/types";

const TABS = [
  { id: "overview", label: "Огляд" },
  { id: "orders", label: "Замовлення" },
  { id: "products", label: "Товари" },
] as const;

const ORDER_STATUSES = ["pending", "progress", "done"] as const;
type OrderStatus = (typeof ORDER_STATUSES)[number];

type TabId = (typeof TABS)[number]["id"];
type AdminOrder = {
  id: string;
  userEmail?: string;
  totalPrice?: number;
  status?: string;
  items?: CartItem[];
};
type ProductEntity = Tour & {
  firestoreId: string;
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  const [createProduct, setCreateProduct] = useState({
    title: "",
    img: "",
    price: "",
    promotion: false,
    promotionPrice: "",
  });
  const [editProduct, setEditProduct] = useState({
    id: "",
    title: "",
    img: "",
    price: "",
    promotion: false,
    promotionPrice: "",
  });
  const [deleteProductId, setDeleteProductId] = useState("");
  const [products, setProducts] = useState<ProductEntity[]>([]);
  const [productsError, setProductsError] = useState("");
  const [productsLoading, setProductsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [orderStatusDraft, setOrderStatusDraft] =
    useState<OrderStatus>("pending");

  useEffect(() => {
    if (activeTab !== "orders") return;

    let cancelled = false;
    setLoadingOrders(true);
    setOrdersError("");

    const loadOrders = async () => {
      try {
        const ordersQuery = query(
          collection(db, "orders"),
          orderBy("createdAt", "desc"),
        );
        const snapshot = await getDocs(ordersQuery);
        const allOrders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AdminOrder[];

        if (!cancelled) {
          setOrders(allOrders);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          setOrdersError("Не вдалося завантажити замовлення.");
        }
      } finally {
        if (!cancelled) {
          setLoadingOrders(false);
        }
      }
    };

    void loadOrders();

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const loadProducts = async () => {
    setProductsLoading(true);
    setProductsError("");
    try {
      const snapshot = await getDocs(collection(db, "itemList"));
      const loaded = snapshot.docs.map((productDoc, index) => {
        const data = productDoc.data() as Partial<Tour>;
        return {
          firestoreId: productDoc.id,
          id: typeof data.id === "number" ? data.id : index + 1,
          title: String(data.title ?? ""),
          img: String(data.img ?? ""),
          price: Number(data.price ?? 0),
          promotion: Boolean(data.promotion),
          promotionPrice:
            typeof data.promotionPrice === "number"
              ? data.promotionPrice
              : undefined,
        };
      });
      setProducts(loaded);
    } catch (error) {
      console.error(error);
      setProductsError("Не вдалося завантажити товари.");
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "products") {
      void loadProducts();
    }
  }, [activeTab]);

  const handleCreateProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await addDoc(collection(db, "itemList"), {
        title: createProduct.title.trim(),
        img: createProduct.img.trim(),
        price: Number(createProduct.price),
        promotion: createProduct.promotion,
        ...(createProduct.promotion && {
          promotionPrice: Number(createProduct.promotionPrice),
        }),
      });
      setCreateProduct({
        title: "",
        img: "",
        price: "",
        promotion: false,
        promotionPrice: "",
      });
      setShowAddForm(false);
      await loadProducts();
    } catch (error) {
      console.error(error);
      setProductsError("Не вдалося створити товар.");
    }
  };

  const handleEditProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editProduct.id.trim()) return;
    try {
      await updateDoc(doc(db, "itemList", editProduct.id.trim()), {
        title: editProduct.title.trim(),
        img: editProduct.img.trim(),
        price: Number(editProduct.price),
        promotion: editProduct.promotion,
        promotionPrice: editProduct.promotion
          ? Number(editProduct.promotionPrice)
          : null,
      });
      setEditProduct({
        id: "",
        title: "",
        img: "",
        price: "",
        promotion: false,
        promotionPrice: "",
      });
      setShowEditForm(false);
      await loadProducts();
    } catch (error) {
      console.error(error);
      setProductsError("Не вдалося оновити товар.");
    }
  };

  const handleDeleteProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!deleteProductId.trim()) return;
    try {
      await deleteDoc(doc(db, "itemList", deleteProductId.trim()));
      setDeleteProductId("");
      await loadProducts();
    } catch (error) {
      console.error(error);
      setProductsError("Не вдалося видалити товар.");
    }
  };

  const getOrderStatus = (order: AdminOrder): OrderStatus => {
    const status = order.status ?? "pending";
    return ORDER_STATUSES.includes(status as OrderStatus)
      ? (status as OrderStatus)
      : "pending";
  };

  const startOrderStatusEdit = (order: AdminOrder) => {
    setEditingOrderId(order.id);
    setOrderStatusDraft(getOrderStatus(order));
  };

  const cancelOrderStatusEdit = () => {
    setEditingOrderId(null);
    setOrderStatusDraft("pending");
  };

  const handleSaveOrderStatus = async (orderId: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: orderStatusDraft });
      setOrders((prev) =>
        prev.map((entry) =>
          entry.id === orderId ? { ...entry, status: orderStatusDraft } : entry,
        ),
      );
      cancelOrderStatusEdit();
    } catch (error) {
      console.error(error);
      setOrdersError("Не вдалося оновити статус замовлення.");
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.content}>
        <h1 className={styles.title}>Адмін панель</h1>

        <div
          className={styles.tabs}
          role="tablist"
          aria-label="Розділи адмінки"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.panel} role="tabpanel">
          {activeTab === "overview" &&
            "Коротка статистика та загальна інформація по сайту."}

          {activeTab === "orders" && (
            <>
              {loadingOrders && (
                <p className={styles.emptyState}>Завантаження замовлень...</p>
              )}
              {!loadingOrders && ordersError && (
                <p className={styles.error}>{ordersError}</p>
              )}
              {!loadingOrders && !ordersError && orders.length === 0 && (
                <p className={styles.emptyState}>Замовлень поки немає.</p>
              )}

              {!loadingOrders && !ordersError && orders.length > 0 && (
                <ul className={styles.ordersList}>
                  {orders.map((order) => (
                    <li key={order.id} className={styles.orderItem}>
                      <div className={styles.orderMeta}>
                        <span>№ {order.id.slice(0, 8)}</span>
                        <span>{order.userEmail ?? "no-email"}</span>
                        {editingOrderId === order.id ? (
                          <div className={styles.orderStatusEdit}>
                            <select
                              className={styles.input}
                              value={orderStatusDraft}
                              onChange={(event) =>
                                setOrderStatusDraft(
                                  event.target.value as OrderStatus,
                                )
                              }
                            >
                              {ORDER_STATUSES.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                            <button
                              className={styles.submitBtn}
                              type="button"
                              onClick={() =>
                                void handleSaveOrderStatus(order.id)
                              }
                            >
                              Зберегти
                            </button>
                            <button
                              className={styles.tab}
                              type="button"
                              onClick={cancelOrderStatusEdit}
                            >
                              Скасувати
                            </button>
                          </div>
                        ) : (
                          <div className={styles.orderStatusView}>
                            <span>{getOrderStatus(order)}</span>
                            {
                              <button
                                className={styles.submitBtn}
                                type="button"
                                onClick={() => startOrderStatusEdit(order)}
                              >
                                Редагувати
                              </button>
                            }
                          </div>
                        )}
                        <span>{order.totalPrice ?? 0} ₴</span>
                      </div>

                      <div className={styles.orderProducts}>
                        {(order.items ?? []).map((productLine, index) => (
                          <div
                            key={`${order.id}-${index}`}
                            className={styles.orderProductItem}
                          >
                            <span>{productLine.item?.title ?? "Товар"}</span>
                            <span>x{productLine.count}</span>
                            <span>
                              {productLine.item?.promotion
                                ? (productLine.item?.promotionPrice ?? 0)
                                : (productLine.item?.price ?? 0)}{" "}
                              ₴
                            </span>
                          </div>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {activeTab === "products" && (
            <div className={styles.productsLayout}>
              <div className={styles.productActions}>
                <button
                  className={styles.submitBtn}
                  type="button"
                  onClick={() => {
                    setShowAddForm((prev) => !prev);
                    if (showEditForm) setShowEditForm(false);
                  }}
                >
                  Додати продукт
                </button>
                <button
                  className={styles.submitBtn}
                  type="button"
                  onClick={() => {
                    setShowEditForm((prev) => !prev);
                    if (showAddForm) setShowAddForm(false);
                  }}
                >
                  Редагувати
                </button>
              </div>

              {productsError && <p className={styles.error}>{productsError}</p>}

              {showAddForm && (
                <form
                  className={styles.formCard}
                  onSubmit={handleCreateProduct}
                >
                  <h2>Додати товар</h2>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Назва"
                    value={createProduct.title}
                    onChange={(event) =>
                      setCreateProduct((prev) => ({
                        ...prev,
                        title: event.target.value,
                      }))
                    }
                  />
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="URL зображення"
                    value={createProduct.img}
                    onChange={(event) =>
                      setCreateProduct((prev) => ({
                        ...prev,
                        img: event.target.value,
                      }))
                    }
                  />
                  <input
                    className={styles.input}
                    type="number"
                    placeholder="Ціна"
                    value={createProduct.price}
                    onChange={(event) =>
                      setCreateProduct((prev) => ({
                        ...prev,
                        price: event.target.value,
                      }))
                    }
                  />
                  <label className={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      checked={createProduct.promotion}
                      onChange={(event) =>
                        setCreateProduct((prev) => ({
                          ...prev,
                          promotion: event.target.checked,
                          promotionPrice: event.target.checked
                            ? prev.promotionPrice
                            : "",
                        }))
                      }
                    />
                    Акція
                  </label>
                  {createProduct.promotion && (
                    <input
                      className={styles.input}
                      type="number"
                      placeholder="Акційна ціна"
                      value={createProduct.promotionPrice}
                      onChange={(event) =>
                        setCreateProduct((prev) => ({
                          ...prev,
                          promotionPrice: event.target.value,
                        }))
                      }
                    />
                  )}
                  <button className={styles.submitBtn} type="submit">
                    Створити
                  </button>
                </form>
              )}

              {showEditForm && (
                <form className={styles.formCard} onSubmit={handleEditProduct}>
                  <h2>Редагувати товар</h2>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder=" ID товару"
                    value={editProduct.id}
                    onChange={(event) =>
                      setEditProduct((prev) => ({
                        ...prev,
                        id: event.target.value,
                      }))
                    }
                  />
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Нова назва"
                    value={editProduct.title}
                    onChange={(event) =>
                      setEditProduct((prev) => ({
                        ...prev,
                        title: event.target.value,
                      }))
                    }
                  />
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Нове URL зображення"
                    value={editProduct.img}
                    onChange={(event) =>
                      setEditProduct((prev) => ({
                        ...prev,
                        img: event.target.value,
                      }))
                    }
                  />
                  <input
                    className={styles.input}
                    type="number"
                    placeholder="Нова ціна"
                    value={editProduct.price}
                    onChange={(event) =>
                      setEditProduct((prev) => ({
                        ...prev,
                        price: event.target.value,
                      }))
                    }
                  />
                  <label className={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      checked={editProduct.promotion}
                      onChange={(event) =>
                        setEditProduct((prev) => ({
                          ...prev,
                          promotion: event.target.checked,
                          promotionPrice: event.target.checked
                            ? prev.promotionPrice
                            : "",
                        }))
                      }
                    />
                    Акція
                  </label>
                  {editProduct.promotion && (
                    <input
                      className={styles.input}
                      type="number"
                      placeholder="promotionPrice"
                      value={editProduct.promotionPrice}
                      onChange={(event) =>
                        setEditProduct((prev) => ({
                          ...prev,
                          promotionPrice: event.target.value,
                        }))
                      }
                    />
                  )}
                  <button className={styles.submitBtn} type="submit">
                    Зберегти
                  </button>
                </form>
              )}

              <form className={styles.formCard} onSubmit={handleDeleteProduct}>
                <h2>Видалити товар</h2>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="ID товару"
                  value={deleteProductId}
                  onChange={(event) => setDeleteProductId(event.target.value)}
                />
                <button className={styles.dangerBtn} type="submit">
                  Видалити
                </button>
              </form>

              {productsLoading ? (
                <p className={styles.emptyState}>Завантаження товарів...</p>
              ) : (
                <ul className={styles.productList}>
                  {products.map((product) => (
                    <li
                      key={product.firestoreId}
                      className={styles.productItem}
                    >
                      <strong>{product.title}</strong>
                      <span>ID: {product.firestoreId}</span>
                      <span>Ціна: {product.price} ₴</span>
                      <span>
                        Акційний: {product.promotion ? "так" : "ні"}
                        {product.promotion &&
                          ` (${product.promotionPrice ?? 0} ₴)`}
                      </span>
                      <button
                        className={styles.submitBtn}
                        type="button"
                        onClick={() => {
                          setShowEditForm(true);
                          setShowAddForm(false);
                          setEditProduct({
                            id: product.firestoreId,
                            title: product.title,
                            img: product.img,
                            price: String(product.price),
                            promotion: product.promotion,
                            promotionPrice:
                              product.promotionPrice !== undefined
                                ? String(product.promotionPrice)
                                : "",
                          });
                        }}
                      >
                        Редагувати
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
