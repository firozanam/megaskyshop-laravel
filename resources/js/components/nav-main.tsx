import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
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
            <SidebarMenuItem key={item.title} className={hasChildren ? 'flex flex-col' : ''}>
                {hasChildren ? (
                    <>
                        <SidebarMenuButton
                            onClick={() => toggleItem(item.title)}
                            isActive={isItemActive}
                            className="w-full justify-between"
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
                                    <SidebarMenuItem key={child.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive(child.href)}
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
                        tooltip={{ children: item.title }}
                    >
                        <Link href={item.href || '#'} prefetch>
                            {item.icon && <item.icon />}
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
