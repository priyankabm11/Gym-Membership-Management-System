import AdminGuard from "../components/AdminGuard";
import MembersClient from "./MembersClient";

export default function MembersPage() {
  return (
    <AdminGuard>
      <MembersClient />
    </AdminGuard>
  );
}
