import { getUserOrders } from "@/shared/api/orderApi";

export default function ProfilePage() {
  console.log(getUserOrders());

  return (
    <>
      <div className="div">твій профіль</div>
    </>
  );
}
