'use client';
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, LogOut, Mic, Podcast, TvMinimal, TvMinimalPlay } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { userAuthStore } from "@/app/store/useAuthStore"
import { toast } from "sonner"

const menuItems = [
    {
        name: "Podcasts",
        icon: Podcast,
        href: "/admin/podcasts/list",
        color: "#3B82F6"
    },
    {
        name: "Add new Podcast",
        icon: Mic,
        href: "/admin/podcasts/add",
        color: "#10B981"
    },
    {
        name: "Episodes",
        icon: TvMinimalPlay,
        href: '/admin/episodes/list',
        color: "#F59E0B"
    },
    {
        name: "Add new Episodes",
        icon: TvMinimal,
        href: '/admin/episodes/add',
        color: "#8B5CF6"
    },
    {
        name: "Logout",
        icon: LogOut,
        href: '',
        color: "#bf0005"
    }
]

interface SidebarProps {
    isOpen: boolean,
    toggle: () => void
}

export default function AdminSidebar({ isOpen, toggle }: SidebarProps) {
    const router = useRouter()
    const [isMobile, setIsMobile] = useState(false);
    const { logout } = userAuthStore();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768)
        }
        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    async function handleLogout() {
        toast.success("User logged out successfully");
        await logout?.();
        router.push('/home');
    }

    return (
        <div
            className={cn(
                "fixed top-0 left-0 z-40 h-screen border-r transition-all duration-300 bg-background shadow-md",
                isOpen ? (isMobile ? "w-64" : "w-64") : "w-16"
            )}
        >
            <div className="px-4 h-16 font-bold font-mono flex items-center justify-between">
                <h1 onClick={() => router.push('/home')} className={cn('font-semibold text-sm sm:text-base cursor-pointer', !isOpen && 'hidden')}>
                    ADMIN PODCAST
                </h1 >
                <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto cursor-pointer"
                    onClick={toggle}
                >
                    {isOpen ? (
                        <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                </Button>
            </div>

            <div className="space-y-1 py-4">
                {menuItems.map((item) => {
                    const isLogout = item.name === "Logout"
                    return (
                        <div
                            key={item.name}
                            onClick={isLogout ? handleLogout : () => router.push(item.href)}
                            className={cn(
                                "flex items-center font-mono px-4 py-2 text-sm cursor-pointer rounded-md transition-all duration-300 group",
                                isLogout
                                    ? "hover:bg-[#bf0005] hover:text-white"
                                    : "hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                                    isLogout
                                        ? "text-[#bf0005] group-hover:text-white"
                                        : ""
                                )}
                                style={{ color: isLogout ? undefined : item.color }}
                            />
                            <span
                                className={cn(
                                    "ml-3 text-foreground font-mono transition-colors duration-300",
                                    !isOpen && "hidden"
                                )}
                            >
                                {item.name}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
