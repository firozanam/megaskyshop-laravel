import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    ShoppingBagIcon,
    HeartIcon,
    UserCircleIcon,
    CreditCardIcon,
    HomeIcon,
    ShoppingCartIcon,
    ClipboardDocumentListIcon,
    Cog6ToothIcon
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

const footerNavItems: NavItem[] = [
    {
        title: 'Account Settings',
        href: '/user/profile',
        icon: UserCircleIcon,
    },
    {
        title: 'Payment Methods',
        href: '/user/payment-methods',
        icon: CreditCardIcon,
    },
    {
        title: 'Preferences',
        href: '/user/preferences',
        icon: Cog6ToothIcon,
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
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
