"use client";

import { cn } from "@/lib/utils";
import {
  HomeIcon,
  LineChartIcon,
  NetworkIcon,
  SettingsIcon,
} from "lucide-react";
import Image from "next/image";
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
    <div className="bg-gray-300 text-black flex flex-col py-4 space-y-2 group transition-all hover:w-72 w-24 px-4 items-center">
      <div className="flex w-full group-hover justify-start items-center h-28 group-hover:gap-2 pl-1">
        <Image src="sky_nexus_logo.svg" height={52} width={52} alt="logo" />
        <h1 className="text-xl w-0 group-hover:w-full font-bold opacity-0 text-nowrap group-hover:opacity-100 transition-all">
          Sky Nexus
        </h1>
      </div>
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            `${
              activePage === item.name.toLowerCase() &&
              "border-solid border-2 border-black bg-gray-500"
            }`,
            "w-full justify-start text-black group-hover:gap-2"
          )}
          onClick={() => setActivePage(item.name.toLowerCase())}
        >
          <item.icon className="h-6 w-6" />
          <div className="scale-0 opacity-0 w-0 group-hover:scale-100 group-hover:opacity-100 duration-500 transition-opacity">
            {item.name}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Sidebar;
