"use client";

import { cn } from "@/lib/utils";
import {
  HomeIcon,
  LineChartIcon,
  NetworkIcon,
  SettingsIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { buttonVariants } from "./ui/button";

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
          className={cn(
            `${activePage === item.name.toLowerCase() && "bg-accent"}`,
            buttonVariants({ variant: "ghost", size: "icon" })
          )}
          onClick={() => setActivePage(item.name.toLowerCase())}
        >
          <item.icon className="h-6 w-6" />
        </Link>
      ))}
    </div>
  );
};

export default Sidebar;
