import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import { useAuthStore } from "../store/useAuthStore";
import { Loading } from "./Loading";

export default function Layout() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      {/* Global loading overlay is always mounted and shows based on store state */}
      <Loading />
      <main className="flex-1 mt-[64px]">
        <Outlet />
      </main>
    </div>
  );
}
