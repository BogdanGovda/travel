import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { MdFavorite, MdDelete } from "react-icons/md";
import styles from "./favoriteModal.module.scss";
import { addToFavorite } from "@/features/favorite/favoriteSlice";
import { useDispatch } from "react-redux";

export default function FavoriteModal() {
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const favorite = useSelector((state: RootState) => state.favorite);

  const renderList = favorite.map((item) => {
    return (
      <div className={styles.modal__card}>
        <img src={item.img} alt="" />
        <h2>{item.title}</h2>
        <div className="price">
          {item.promotion ? (
            <div className={styles.modal__new}>{item.promotionPrice} $</div>
          ) : (
            <div>{item.price}$</div>
          )}
        </div>
        <button
          onClick={() => dispatch(addToFavorite(item))}
          className={styles.modal__btn}
        >
          <MdDelete />
        </button>
      </div>
    );
  });

  return (
    <div>
      <button onClick={handleOpen} className={styles.modal__open}>
        <MdFavorite></MdFavorite>
        {favorite.length}
      </button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className={styles.modal}>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
          ></Typography>
          <div>
            <div className={styles.modal__title}>Ваше улюблене: </div>
            {renderList.length > 0 ? (
              renderList
            ) : (
              <div className={styles.modal__empty}>
                <div className={styles.modal__subtitle}>
                  Упс...У вас ще немає улюбленого
                </div>
              </div>
            )}
          </div>
        </Box>
      </Modal>
    </div>
  );
}
