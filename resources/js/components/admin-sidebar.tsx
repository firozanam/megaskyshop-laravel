import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    Package, 
    Users, 
    Settings, 
    ShoppingBag, 
    Tag, 
    Home, 
    UserCircle,
    Mail,
    LineChart,
    Share2
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Products',
        href: '/admin/products',
        icon: Package,
    },
    {
        title: 'Categories',
        href: '/admin/categories',
        icon: Tag,
    },
    {
        title: 'Orders',
        href: '/admin/orders',
        icon: ShoppingBag,
    },
    {
        title: 'Customers',
        href: '/admin/customers',
        icon: UserCircle,
    },
    {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Homepage',
        href: '/admin/homepage',
        icon: Home,
    },
    {
        title: 'Settings',
        icon: Settings,
        children: [
            {
                title: 'SMTP Settings',
                href: '/admin/settings/smtp',
                icon: Mail,
            },
            {
                title: 'Google Analytics',
                href: '/admin/settings/google-analytics',
                icon: LineChart,
            },
            {
                title: 'Facebook Pixel',
                href: '/admin/settings/facebook-pixel',
                icon: Share2,
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'View Store',
        href: '/',
        icon: ShoppingBag,
    },
];

export function AdminSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/admin/dashboard" prefetch>
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