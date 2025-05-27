import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    ShoppingBagIcon,
    HeartIcon,
    HomeIcon,
    ShoppingCartIcon,
    ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: HomeIcon,
    },
    {
        title: 'My Orders',
        href: '/user/orders',
        icon: ShoppingBagIcon,
    },
    {
        title: 'Wishlist',
        href: '/user/wishlist',
        icon: HeartIcon,
    },
    {
        title: 'Shopping Cart',
        href: '/cart',
        icon: ShoppingCartIcon,
    },
    {
        title: 'Browse Products',
        href: '/products',
        icon: ClipboardDocumentListIcon,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
