"use client";

import {
  HomeIcon,
  LineChartIcon,
  NetworkIcon,
  SettingsIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const Sidebar = () => {
  const [activePage, setActivePage] = useState("home");

  const navigation = [
    { name: "Home", icon: HomeIcon, href: "/" },
    { name: "Analysis", icon: LineChartIcon, href: "analysis" },
    { name: "About", icon: NetworkIcon, href: "network" },
    { name: "Settings", icon: SettingsIcon, href: "settings" },
  ];

  return (
    <div className="bg-gray-900 text-white w-16 flex flex-col items-center py-4 space-y-2">
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`flex items-center p-2 rounded-full hover:bg-gray-700 ${
            activePage === item.name.toLowerCase() ? "bg-gray-700" : ""
          }`}
          onClick={() => setActivePage(item.name.toLowerCase())}
        >
          <item.icon className="h-6 w-6" />
        </Link>
      ))}
    </div>
  );
};

export default Sidebar;
