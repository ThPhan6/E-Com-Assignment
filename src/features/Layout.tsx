import { Outlet } from "react-router-dom";
import { Loading } from "./Loading";
import NavBar from "./NavBar";

export default function Layout() {
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
