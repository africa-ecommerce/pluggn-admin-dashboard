"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Zap,
  BarChart3,
  ShoppingCart,
  Settings,
  FileText,
  Bell,
  Shield,
  HelpCircle,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Supplier Management",
    href: "/dashboard/suppliers",
    icon: Users,
  },
  {
    name: "Plug Management",
    href: "/dashboard/plugs",
    icon: Zap,
  },
  {
    name: "Order Management",
    href: "/dashboard/orders",
    icon: ShoppingCart,
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    name: "Reports",
    href: "/dashboard/reports",
    icon: FileText,
  },
  {
    name: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
  },
  {
    name: "User Roles",
    href: "/dashboard/roles",
    icon: Shield,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    name: "Help & Support",
    href: "/dashboard/support",
    icon: HelpCircle,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
      <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-900">
                Admin Panel
              </h1>
              <p className="text-xs text-gray-500">App Management</p>
            </div>
          </div>
        </div>
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    isActive
                      ? "bg-blue-50 border-r-2 border-blue-600 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
                  )}
                >
                  <item.icon
                    className={cn(
                      isActive
                        ? "text-blue-500"
                        : "text-gray-400 group-hover:text-gray-500",
                      "mr-3 flex-shrink-0 h-5 w-5"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">A</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Admin User</p>
              <p className="text-xs text-gray-500">admin@app.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
