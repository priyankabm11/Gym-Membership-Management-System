import AdminGuard from "../components/AdminGuard";
import MembershipsClient from "./MembershipsClient";

export default function MembershipsPage() {
  return (
    <AdminGuard>
      <MembershipsClient />
    </AdminGuard>
  );
}
