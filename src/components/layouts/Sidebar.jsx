import { MENU } from "../../constants/menu";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-white border-r flex flex-col">
      {/* Logo */}
      <div className="p-4 font-bold text-lg">🔥 TEAM 102</div>

      {/* Menu scroll */}
      <div className="flex-1 overflow-y-auto">
        {MENU.map((item, i) => (
          <NavLink
            key={i}
            to={item.path}
            className="block px-4 py-2 hover:bg-gray-100"
          >
            {item.icon} {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
