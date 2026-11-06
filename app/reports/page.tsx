import AdminGuard from "../components/AdminGuard";
import ReportsClient from "./ReportsClient";

export default function ReportsPage() {
  return (
    <AdminGuard>
      <ReportsClient />
    </AdminGuard>
  );
}
