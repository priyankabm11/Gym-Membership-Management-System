import AdminGuard from "../components/AdminGuard";
import AttendanceClient from "./AttendanceClient";

export default function AttendancePage() {
  return (
    <AdminGuard>
      <AttendanceClient />
    </AdminGuard>
  );
}
