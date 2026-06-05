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
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/shared/orderStatus";

const TABS = [
  { id: "overview", label: "Огляд" },
  { id: "orders", label: "Замовлення" },
  { id: "products", label: "Товари" },
] as const;

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

type ProductFormState = {
  title: string;
  img: string;
  price: string;
  promotion: boolean;
  promotionPrice: string;
};

const EMPTY_PRODUCT_FORM: ProductFormState = {
  title: "",
  img: "",
  price: "",
  promotion: false,
  promotionPrice: "",
};

const mapDocToProduct = (
  productDoc: { id: string; data: () => unknown },
  index: number,
): ProductEntity => {
  const data = productDoc.data() as Partial<Tour>;
  const promotion = Boolean(data.promotion);

  return {
    firestoreId: productDoc.id,
    id: typeof data.id === "number" ? data.id : index + 1,
    title: String(data.title ?? ""),
    img: String(data.img ?? ""),
    price: Number(data.price ?? 0),
    promotion,
    ...(promotion && {
      promotionPrice: Number(data.promotionPrice ?? 0),
    }),
  };
};

const fetchProducts = async (): Promise<ProductEntity[]> => {
  const snapshot = await getDocs(collection(db, "itemList"));
  return snapshot.docs.map((productDoc, index) =>
    mapDocToProduct(productDoc, index),
  );
  //return snapshot.docs.map(mapDocToProduct);
};

const isValidProductForm = (form: ProductFormState): boolean => {
  const price = Number(form.price);
  if (
    !form.title.trim() ||
    !form.img.trim() ||
    Number.isNaN(price) ||
    price < 0
  ) {
    return false;
  }
  if (form.promotion) {
    const promotionPrice = Number(form.promotionPrice);
    if (Number.isNaN(promotionPrice) || promotionPrice < 0) {
      return false;
    }
  }
  return true;
};

function tabA11yProps(tabId: TabId) {
  return {
    id: `admin-tab-${tabId}`,
    "aria-controls": `admin-tabpanel-${tabId}`,
  };
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  const [overviewStats, setOverviewStats] = useState({
    orders: 0,
    products: 0,
    pendingOrders: 0,
  });
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState("");

  const [createProduct, setCreateProduct] =
    useState<ProductFormState>(EMPTY_PRODUCT_FORM);
  const [editProduct, setEditProduct] = useState<
    ProductFormState & { id: string }
  >({
    id: "",
    ...EMPTY_PRODUCT_FORM,
  });
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
        const allOrders = snapshot.docs.map((orderDoc) => ({
          id: orderDoc.id,
          ...orderDoc.data(),
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

  useEffect(() => {
    if (activeTab !== "overview") return;

    let cancelled = false;
    setOverviewLoading(true);
    setOverviewError("");

    const loadOverview = async () => {
      try {
        const [ordersSnapshot, productsSnapshot] = await Promise.all([
          getDocs(collection(db, "orders")),
          getDocs(collection(db, "itemList")),
        ]);

        if (cancelled) return;

        const pendingOrders = ordersSnapshot.docs.filter((orderDoc) => {
          const status =
            (orderDoc.data().status as string | undefined) ?? "pending";
          return status === "pending";
        }).length;

        setOverviewStats({
          orders: ordersSnapshot.size,
          products: productsSnapshot.size,
          pendingOrders,
        });
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          setOverviewError("Не вдалося завантажити статистику.");
        }
      } finally {
        if (!cancelled) {
          setOverviewLoading(false);
        }
      }
    };

    void loadOverview();

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const loadProducts = async () => {
    setProductsLoading(true);
    setProductsError("");
    try {
      setProducts(await fetchProducts());
    } catch (error) {
      console.error(error);
      setProductsError("Не вдалося завантажити товари.");
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== "products") return;

    let cancelled = false;
    setProductsLoading(true);
    setProductsError("");

    void (async () => loadProducts())();

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const handleCreateProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValidProductForm(createProduct)) {
      setProductsError("Заповніть усі поля коректно.");
      return;
    }
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
      setCreateProduct(EMPTY_PRODUCT_FORM);
      setShowAddForm(false);
      await loadProducts();
    } catch (error) {
      console.error(error);
      setProductsError("Не вдалося створити товар.");
    }
  };

  const handleEditProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editProduct.id.trim() || !isValidProductForm(editProduct)) {
      setProductsError("Заповніть усі поля коректно.");
      return;
    }
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
      setEditProduct({ id: "", ...EMPTY_PRODUCT_FORM });
      setShowEditForm(false);
      await loadProducts();
    } catch (error) {
      console.error(error);
      setProductsError("Не вдалося оновити товар.");
    }
  };

  const handleDeleteProduct = async (firestoreId: string, title: string) => {
    const confirmed = window.confirm(
      `Видалити товар «${title}»? Цю дію не можна скасувати.`,
    );
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "itemList", firestoreId));
      if (editProduct.id === firestoreId) {
        setEditProduct({ id: "", ...EMPTY_PRODUCT_FORM });
        setShowEditForm(false);
      }
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

  const openProductEdit = (product: ProductEntity) => {
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
              {...tabA11yProps(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div
          className={styles.panel}
          role="tabpanel"
          id={`admin-tabpanel-${activeTab}`}
          aria-labelledby={`admin-tab-${activeTab}`}
        >
          {activeTab === "overview" && (
            <>
              {overviewLoading && (
                <p className={styles.emptyState}>Завантаження статистики...</p>
              )}
              {!overviewLoading && overviewError && (
                <p className={styles.error}>{overviewError}</p>
              )}
              {!overviewLoading && !overviewError && (
                <ul className={styles.overviewStats}>
                  <li className={styles.overviewStat}>
                    <span className={styles.overviewStatValue}>
                      {overviewStats.orders}
                    </span>
                    <span className={styles.overviewStatLabel}>
                      Усього замовлень
                    </span>
                  </li>
                  <li className={styles.overviewStat}>
                    <span className={styles.overviewStatValue}>
                      {overviewStats.pendingOrders}
                    </span>
                    <span className={styles.overviewStatLabel}>
                      Очікують обробки
                    </span>
                  </li>
                  <li className={styles.overviewStat}>
                    <span className={styles.overviewStatValue}>
                      {overviewStats.products}
                    </span>
                    <span className={styles.overviewStatLabel}>
                      Товарів у каталозі
                    </span>
                  </li>
                </ul>
              )}
            </>
          )}

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
                        <span>{order.userEmail ?? "—"}</span>
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
                                  {ORDER_STATUS_LABELS[status]}
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
                              className={styles.cancelBtn}
                              type="button"
                              onClick={cancelOrderStatusEdit}
                            >
                              Скасувати
                            </button>
                          </div>
                        ) : (
                          <div className={styles.orderStatusView}>
                            <span>
                              {ORDER_STATUS_LABELS[getOrderStatus(order)]}
                            </span>
                            <button
                              className={styles.submitBtn}
                              type="button"
                              onClick={() => startOrderStatusEdit(order)}
                            >
                              Редагувати
                            </button>
                          </div>
                        )}
                        <span>{order.totalPrice ?? 0} ₴</span>
                      </div>

                      <div className={styles.orderProducts}>
                        {(order.items ?? []).map((productLine, index) => (
                          <div
                            key={`${order.id}-${productLine.item?.id ?? index}`}
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
                  {showAddForm ? "Сховати форму" : "Додати товар"}
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
                    required
                  />
                  <input
                    className={styles.input}
                    type="url"
                    placeholder="URL зображення"
                    value={createProduct.img}
                    onChange={(event) =>
                      setCreateProduct((prev) => ({
                        ...prev,
                        img: event.target.value,
                      }))
                    }
                    required
                  />
                  <input
                    className={styles.input}
                    type="number"
                    min={0}
                    placeholder="Ціна"
                    value={createProduct.price}
                    onChange={(event) =>
                      setCreateProduct((prev) => ({
                        ...prev,
                        price: event.target.value,
                      }))
                    }
                    required
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
                      min={0}
                      placeholder="Акційна ціна"
                      value={createProduct.promotionPrice}
                      onChange={(event) =>
                        setCreateProduct((prev) => ({
                          ...prev,
                          promotionPrice: event.target.value,
                        }))
                      }
                      required
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
                    placeholder="Назва"
                    value={editProduct.title}
                    onChange={(event) =>
                      setEditProduct((prev) => ({
                        ...prev,
                        title: event.target.value,
                      }))
                    }
                    required
                  />
                  <input
                    className={styles.input}
                    type="url"
                    placeholder="URL зображення"
                    value={editProduct.img}
                    onChange={(event) =>
                      setEditProduct((prev) => ({
                        ...prev,
                        img: event.target.value,
                      }))
                    }
                    required
                  />
                  <input
                    className={styles.input}
                    type="number"
                    min={0}
                    placeholder="Ціна"
                    value={editProduct.price}
                    onChange={(event) =>
                      setEditProduct((prev) => ({
                        ...prev,
                        price: event.target.value,
                      }))
                    }
                    required
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
                      min={0}
                      placeholder="Акційна ціна"
                      value={editProduct.promotionPrice}
                      onChange={(event) =>
                        setEditProduct((prev) => ({
                          ...prev,
                          promotionPrice: event.target.value,
                        }))
                      }
                      required
                    />
                  )}
                  <div className={styles.productItemActions}>
                    <button className={styles.submitBtn} type="submit">
                      Зберегти
                    </button>
                    <button
                      className={styles.cancelBtn}
                      type="button"
                      onClick={() => {
                        setShowEditForm(false);
                        setEditProduct({ id: "", ...EMPTY_PRODUCT_FORM });
                      }}
                    >
                      Скасувати
                    </button>
                  </div>
                </form>
              )}

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
                      <div className={styles.productItemActions}>
                        <button
                          className={styles.submitBtn}
                          type="button"
                          onClick={() => openProductEdit(product)}
                        >
                          Редагувати
                        </button>
                        <button
                          className={styles.dangerBtn}
                          type="button"
                          onClick={() =>
                            void handleDeleteProduct(
                              product.firestoreId,
                              product.title,
                            )
                          }
                        >
                          Видалити
                        </button>
                      </div>
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
