import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/", icon: "🏠", label: "ホーム" },
  { to: "/collection", icon: "📖", label: "ずかん" },
  { to: "/map", icon: "🗺️", label: "ちず" },
  { to: "/settings", icon: "⚙️", label: "せってい" },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-[480px] mx-auto flex justify-around">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-3 text-sm transition-colors ${
                isActive ? "text-pink font-bold" : "text-gray-500"
              }`
            }
          >
            <span className="text-2xl">{tab.icon}</span>
            <span className="text-xs mt-0.5">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
