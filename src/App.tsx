import { useState } from "react";
import Header from "./widgets/header/Header";
import MainRouter from "./routes/MainRouter";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Header></Header>
      <MainRouter />
    </>
  );
}

export default App;
