import { loginUser, registerUser } from "@/shared/api/authApi";
import { useState } from "react";
import styles from "./AuthPage.module.scss";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";

export default function AuthPage() {
  const login = false;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmitRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const user = await registerUser(email, password);

      console.log(user);
    } catch (error) {
      console.log(error);
    }
  };
  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const user = await loginUser(email, password);

      console.log(user);
    } catch (error) {
      console.log(error);
    }
  };
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("Logged in", user);
    } else {
      console.log("Logged out");
    }
  });
  return (
    <div className={styles.wrapper}>
      {login ? (
        <form onSubmit={handleSubmitRegister} className={styles.form}>
          <input
            className={styles.form__input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />

          <input
            className={styles.form__input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />

          <button className={styles.form__btn} type="submit">
            Register
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmitLogin} className={styles.form}>
          <input
            className={styles.form__input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className={styles.form__input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className={styles.form__btn} type="submit">
            Login
          </button>
        </form>
      )}
    </div>
  );
}
