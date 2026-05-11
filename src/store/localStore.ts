export function addToLocalStore(name, arr) {
  try {
    const serialisedState = JSON.stringify(arr);
    localStorage.setItem(name, serialisedState);
  } catch (e) {
    console.warn(e);
  }
}
export function getFromLocalStore(name) {
  try {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (err) {
    console.log("err", err);
    return [];
  }
}
