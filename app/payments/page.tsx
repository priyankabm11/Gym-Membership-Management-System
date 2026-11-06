import AdminGuard from "../components/AdminGuard";
import PaymentsClient from "./PaymentsClient";

export default function PaymentsPage() {
  return (
    <AdminGuard>
      <PaymentsClient />
    </AdminGuard>
  );
}
