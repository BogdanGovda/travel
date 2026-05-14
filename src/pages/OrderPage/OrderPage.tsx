import styles from "./OrderPage.module.scss";
import TextField from "@mui/material/TextField";

export default function OrderPage() {
  return (
    <section className={styles.wrapper}>
      <h1>Оформлення</h1>
      <TextField
        required
        id="outlined-required"
        label="Required"
        defaultValue="Hello World"
      />
    </section>
  );
}
