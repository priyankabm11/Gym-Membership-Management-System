import AdminGuard from "../components/AdminGuard";
import TrainersClient from "./TrainersClient";

export default function TrainersPage() {
  return (
    <AdminGuard>
      <TrainersClient />
    </AdminGuard>
  );
}
