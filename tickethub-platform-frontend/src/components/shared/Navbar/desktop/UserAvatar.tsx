// // components/UserAvatar.tsx
// import React, { useEffect, useRef, useState } from "react";
// import {
//   HistoryIcon,
//   LayoutDashboard,
//   LogOut,
//   Receipt,
//   Settings,
//   User,
// } from "lucide-react";
// import { Link } from "react-router";

// export interface AvatarUser {
//   name: string;
//   email?: string;
//   avatarUrl?: string | null;
//   role?: "attendee" | "organizer" | "admin";
// }

// interface UserAvatarProps {
//   user: AvatarUser;
//   onLogout: () => void | Promise<void>;
// }

// const getInitials = (name: string) =>
//   name
//     .trim()
//     .split(/\s+/)
//     .slice(0, 2)
//     .map((part) => part[0]?.toUpperCase() ?? "")
//     .join("") || "?";

// // Adjust these paths to match your routes
// const dashboardPathByRole = {
//   attendee: "/attendee",
//   organizer: "/organizer",
//   admin: "/admin",
// } as const;

// export const UserAvatar: React.FC<UserAvatarProps> = ({ user, onLogout }) => {
//   const [open, setOpen] = useState(false);
//   const [imgFailed, setImgFailed] = useState(false);
//   const [loggingOut, setLoggingOut] = useState(false);
//   const containerRef = useRef<HTMLDivElement>(null);

//   // Close on outside click or Escape
//   useEffect(() => {
//     if (!open) return;

//     const handleClick = (e: MouseEvent) => {
//       if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
//     };
//     const handleKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") setOpen(false);
//     };

//     document.addEventListener("mousedown", handleClick);
//     document.addEventListener("keydown", handleKey);
//     return () => {
//       document.removeEventListener("mousedown", handleClick);
//       document.removeEventListener("keydown", handleKey);
//     };
//   }, [open]);

//   const role = user.role ?? "attendee";

//   const items = [
//     {
//       label: "Dashboard",
//       to: dashboardPathByRole[role],
//       icon: LayoutDashboard,
//     },
//     { label: "Order history", to: "/attendee/orders", icon: HistoryIcon },
//     { label: "Account Profile", to: "/profile", icon: User },
//     // { label: "Settings", to: "/settings", icon: Settings },
//   ];

//   const handleLogout = async () => {
//     setLoggingOut(true);
//     try {
//       await onLogout();
//     } finally {
//       setLoggingOut(false);
//       setOpen(false);
//     }
//   };

//   const showImage = user.avatarUrl && !imgFailed;

//   return (
//     <div ref={containerRef} className="relative">
//       <button
//         type="button"
//         onClick={() => setOpen((o) => !o)}
//         aria-haspopup="menu"
//         aria-expanded={open}
//         aria-label="Open user menu"
//         className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-semibold  text-white ring-2 ring-transparent transition hover:ring-primary/30 focus:outline-none focus-visible:ring-primary/50 cursor-pointer"
//       >
//         {showImage ? (
//           <img
//             src={user.avatarUrl!}
//             alt={user.name}
//             onError={() => setImgFailed(true)}
//             className="h-full w-full object-cover"
//           />
//         ) : (
//           getInitials(user.name)
//         )}
//       </button>

//       {open && (
//         <div
//           role="menu"
//           className="absolute right-0 z-50 mt-2 w-60 origin-top-right overflow-hidden rounded-2xl bg-white  text-black   "
//         >
//           {/* Header */}
//           <div className="border-b border-neutral-100 px-4 py-3">
//             <p className="truncate text-sm font-semibold ">{user.name}</p>
//             {user.email && <p className="truncate text-xs ">{user.email}</p>}
//           </div>

//           {/* Links */}
//           <div className="py-1">
//             {items.map(({ label, to, icon: Icon }) => (
//               <Link
//                 key={label}
//                 to={to}
//                 role="menuitem"
//                 onClick={() => setOpen(false)}
//                 className="flex items-center gap-3 px-4 py-2.5 text-sm "
//               >
//                 <Icon className="h-4 w-4 " />
//                 {label}
//               </Link>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ComponentType, SVGProps } from "react";
import { Link } from "react-router";

interface UserNavItem {
  label: string;
  to: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

interface UserNavMenuProps {
  user: {
    name: string;
    email?: string;
    avatarUrl?: string | null;
  };
  items: UserNavItem[];
}

export function UserNavMenu({ user, items }: UserNavMenuProps) {
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button
          type="button"
          aria-label="Open user menu"
          className="h-10 w-10 cursor-pointer overflow-hidden rounded-full ring-2 ring-transparent transition hover:ring-primary/40 focus:outline-none focus-visible:ring-primary/60"
        >
          <Avatar className="h-full w-full">
            <AvatarImage
              src={user.avatarUrl ?? undefined}
              alt={user.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary font-semibold text-primary-foreground">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-60 rounded-2xl border border-background/10 bg-foreground p-2 text-background shadow-xl ring-0"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-4 py-3 font-normal text-background">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            {user.email && (
              <p className="truncate text-xs text-background/70">
                {user.email}
              </p>
            )}
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-background/20" />

        <DropdownMenuGroup className="py-1">
          {items.map(({ label, to, icon: Icon }) => (
            <DropdownMenuItem
              key={label}
              className="cursor-pointer rounded-xl p-0 text-background focus:bg-background/15 "
            >
              <Link
                to={to}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm"
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
