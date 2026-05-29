import { loginUser, registerUser } from "@/shared/api/authApi";
import { auth } from "@/firebase";

import { onAuthStateChanged, signOut } from "firebase/auth";
import type { User } from "firebase/auth";

import { useEffect, useState } from "react";

import styles from "./AuthPage.module.scss";
import { Link } from "react-router-dom";

type AuthMode = "login" | "register";

type FormState = {
  email: string;
  password: string;
};

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");

  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
  });

  const [user, setUser] = useState<User | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleModeSwitch = () => {
    setMode((prev) => (prev === "login" ? "register" : "login"));

    setForm({
      email: "",
      password: "",
    });

    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    try {
      if (mode === "login") {
        await loginUser(form.email, form.password);
      } else {
        await registerUser(form.email, form.password);
      }

      setForm({
        email: "",
        password: "",
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log(error);
    }
  };

  if (user) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.logged}>
          <h1>Ви успішно залогінені</h1>
          <h2>
            <Link to="/profile">Переглянути свій профіль</Link>
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1 className={styles.form__title}>
          {mode === "login" ? "Login" : "Register"}
        </h1>

        <input
          className={styles.form__input}
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />

        <input
          className={styles.form__input}
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />

        {error && <p className={styles.form__error}>{error}</p>}

        <button className={styles.form__btn} type="submit" disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
        </button>

        <button
          type="button"
          className={styles.form__toggle}
          onClick={handleModeSwitch}
        >
          {mode === "login"
            ? "Don't have an account? Register"
            : "Already have an account? Login"}
        </button>
      </form>
    </div>
  );
}
