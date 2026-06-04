import { useEffect, useMemo, useState } from "react";
import ItemCard from "@/components/card/itemCard";
import { getTours } from "@/shared/api/toursApi";
import type { Tour } from "@/shared/api/types";
import styles from "./Catalog.module.scss";

function getTourPrice(tour: Tour): number {
  return tour.promotion && tour.promotionPrice != null
    ? tour.promotionPrice
    : tour.price;
}

function Catalog() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>(
    [],
  );
  const [promotionOnly, setPromotionOnly] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    getTours()
      .then(setTours)
      .finally(() => setLoading(false));
  }, []);

  const destinations = useMemo(
    () => [...new Set(tours.map((tour) => tour.title))].sort(),
    [tours],
  );

  const filteredTours = useMemo(() => {
    const query = search.trim().toLowerCase();
    const min = minPrice === "" ? null : Number(minPrice);
    const max = maxPrice === "" ? null : Number(maxPrice);

    return tours.filter((tour) => {
      if (query && !tour.title.toLowerCase().includes(query)) {
        return false;
      }

      if (
        selectedDestinations.length > 0 &&
        !selectedDestinations.includes(tour.title)
      ) {
        return false;
      }

      if (promotionOnly && !tour.promotion) {
        return false;
      }

      const price = getTourPrice(tour);
      if (min !== null && !Number.isNaN(min) && price < min) {
        return false;
      }
      if (max !== null && !Number.isNaN(max) && price > max) {
        return false;
      }

      return true;
    });
  }, [
    tours,
    search,
    selectedDestinations,
    promotionOnly,
    minPrice,
    maxPrice,
  ]);

  const toggleDestination = (title: string) => {
    setSelectedDestinations((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title],
    );
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedDestinations([]);
    setPromotionOnly(false);
    setMinPrice("");
    setMaxPrice("");
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedDestinations.length > 0 ||
    promotionOnly ||
    minPrice !== "" ||
    maxPrice !== "";

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Каталог</h1>
      <div className={styles.container}>
        <aside className={styles.filter}>
          <h2 className={styles.filter__title}>Фільтри</h2>

          <div className={styles.filter__group}>
            <span className={styles.filter__label}>Напрямок</span>
            <ul className={styles.filter__list}>
              {destinations.map((title) => (
                <li key={title} className={styles.filter__item}>
                  <label className={styles.filter__checkbox}>
                    <input
                      type="checkbox"
                      checked={selectedDestinations.includes(title)}
                      onChange={() => toggleDestination(title)}
                    />
                    <span>{title}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.filter__group}>
            <label className={styles.filter__checkbox}>
              <input
                type="checkbox"
                checked={promotionOnly}
                onChange={(e) => setPromotionOnly(e.target.checked)}
              />
              <span>Тільки акції</span>
            </label>
          </div>

          <div className={styles.filter__group}>
            <span className={styles.filter__label}>Ціна ($)</span>
            <div className={styles.filter__price}>
              <input
                type="number"
                min={0}
                placeholder="Від"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className={styles.input}
              />
              <input
                type="number"
                min={0}
                placeholder="До"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className={styles.input}
              />
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className={styles.resetBtn}
              onClick={resetFilters}
            >
              Скинути фільтри
            </button>
          )}
        </aside>

        <div className={styles.content}>
          <div className={styles.search}>
            <input
              type="search"
              placeholder="Пошук за назвою..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.search__input}
              aria-label="Пошук турів"
            />
          </div>

          <div className={styles.result}>
            {loading ? (
              <p className={styles.result__message}>Завантаження...</p>
            ) : filteredTours.length === 0 ? (
              <p className={styles.result__message}>
                Нічого не знайдено. Спробуйте змінити пошук або фільтри.
              </p>
            ) : (
              <>
                <p className={styles.result__count}>
                  Знайдено: {filteredTours.length}
                </p>
                <div className={styles.result__grid}>
                  {filteredTours.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Catalog;
