import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
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
    Share2,
    BarChart3,
    ChevronDown,
    ChevronRight,
    FileIcon
} from 'lucide-react';
import AppLogo from './app-logo';
import React, { useState } from 'react';
import { Icon } from '@/components/icon';

// Create a custom animated nav main component
function AnimatedNavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
    
    const toggleItem = (title: string) => {
        setExpandedItems(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };
    
    const isActive = (href?: string) => {
        if (!href) return false;
        return href === page.url || page.url.startsWith(href);
    };
    
    const renderMenuItem = (item: NavItem) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems[item.title] || false;
        
        // Check if this item or any of its children are active
        const isItemActive = isActive(item.href) || 
            (hasChildren && item.children?.some(child => isActive(child.href)));
        
        return (
            <SidebarMenuItem 
                key={item.title} 
                className={`transition-all duration-200 hover:translate-x-1 ${hasChildren ? 'flex flex-col' : ''}`}
            >
                {hasChildren ? (
                    <>
                        <SidebarMenuButton
                            onClick={() => toggleItem(item.title)}
                            isActive={isItemActive}
                            className="group relative overflow-hidden w-full justify-between transition-all duration-200 hover:pl-4"
                            tooltip={{ children: item.title }}
                        >
                            <div className="flex items-center">
                                {item.icon && <item.icon className="mr-2" />}
                                <span>{item.title}</span>
                            </div>
                            {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                        </SidebarMenuButton>
                        
                        {isExpanded && (
                            <div className="ml-8 mt-1 space-y-1 w-full">
                                {item.children?.map(child => (
                                    <SidebarMenuItem 
                                        key={child.title}
                                        className="transition-all duration-200 hover:translate-x-1"
                                    >
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive(child.href)}
                                            className="group relative overflow-hidden transition-all duration-200 hover:pl-4"
                                            tooltip={{ children: child.title }}
                                        >
                                            <Link href={child.href || '#'} prefetch>
                                                {child.icon && <child.icon className="mr-2" />}
                                                <span>{child.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <SidebarMenuButton
                        asChild
                        isActive={isActive(item.href)}
                        className="group relative overflow-hidden transition-all duration-200 hover:pl-4"
                        tooltip={{ children: item.title }}
                    >
                        <Link href={item.href || '#'} prefetch>
                            {item.icon && <item.icon className="mr-2" />}
                            <span>{item.title}</span>
                        </Link>
                    </SidebarMenuButton>
                )}
            </SidebarMenuItem>
        );
    };
    
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map(renderMenuItem)}
            </SidebarMenu>
        </SidebarGroup>
    );
}

// Create a custom animated nav footer component
function AnimatedNavFooter({
    items,
    className,
    ...props
}: React.ComponentPropsWithoutRef<typeof SidebarGroup> & {
    items: NavItem[];
}) {
    return (
        <SidebarGroup {...props} className={`group-data-[collapsible=icon]:p-0 ${className || ''}`}>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem 
                        key={item.title}
                        className="transition-all duration-200 hover:translate-x-1"
                    >
                        <SidebarMenuButton
                            asChild
                            className="group relative overflow-hidden text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100 transition-all duration-200 hover:pl-4"
                        >
                            <a href={item.href} target="_blank" rel="noopener noreferrer">
                                {item.icon && <Icon iconNode={item.icon} className="h-5 w-5 mr-2" />}
                                <span>{item.title}</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}

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
        title: 'Reports',
        href: '/admin/reports',
        icon: BarChart3,
    },
    {
        title: 'File Manager',
        href: '/admin/filemanager',
        icon: FileIcon,
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
                    <SidebarMenuItem className="transition-transform duration-300 hover:scale-105">
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/admin/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <AnimatedNavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <AnimatedNavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
} 