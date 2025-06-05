import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Menu, Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
];

const rightNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

const activeItemStyles = 'text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100';

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Handle responsive behavior
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        
        // Initial check
        checkScreenSize();
        
        // Add event listener for window resize
        window.addEventListener('resize', checkScreenSize);
        
        // Cleanup
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Close mobile menu when switching to desktop view
    useEffect(() => {
        if (!isMobile) {
            setIsOpen(false);
        }
    }, [isMobile]);

    return (
        <>
            <div className="border-sidebar-border/80 border-b">
                <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:max-w-7xl">
                    <div className="flex items-center">
                        {/* Mobile Menu Button */}
                        <div className="lg:hidden">
                            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="mr-2 h-[34px] w-[34px]">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="bg-sidebar flex h-full w-[85vw] max-w-[300px] flex-col items-stretch justify-between sm:w-[350px]">
                                    <div className="flex items-center justify-between">
                                        <SheetHeader className="flex justify-start text-left">
                                            <AppLogoIcon className="h-6 w-6 fill-current text-black dark:text-white" />
                                        </SheetHeader>
                                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                                            <X className="h-5 w-5" />
                                        </Button>
                                    </div>
                                    <div className="flex h-full flex-1 flex-col space-y-4 p-4">
                                        <div className="flex h-full flex-col justify-between text-sm">
                                            <div className="flex flex-col space-y-4">
                                                {mainNavItems.map((item) => (
                                                    item.href ? (
                                                        <Link 
                                                            key={item.title} 
                                                            href={item.href} 
                                                            className="flex items-center space-x-2 rounded-md px-3 py-2 font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                                            onClick={() => setIsOpen(false)}
                                                        >
                                                            {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                            <span>{item.title}</span>
                                                        </Link>
                                                    ) : (
                                                        <div 
                                                            key={item.title}
                                                            className="flex items-center space-x-2 rounded-md px-3 py-2 font-medium"
                                                        >
                                                            {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                            <span>{item.title}</span>
                                                        </div>
                                                    )
                                                ))}
                                            </div>

                                            <div className="flex flex-col space-y-4 pt-8">
                                                <div className="mb-2 px-3 text-xs font-semibold uppercase text-neutral-500">Resources</div>
                                                {rightNavItems.map((item) => (
                                                    <a
                                                        key={item.title}
                                                        href={item.href}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center space-x-2 rounded-md px-3 py-2 font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                                        onClick={() => setIsOpen(false)}
                                                    >
                                                        {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                        <span>{item.title}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
                                        <div className="flex items-center space-x-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                                <AvatarFallback>{getInitials(auth.user.name)}</AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">{auth.user.name}</p>
                                                <p className="text-xs text-neutral-500">{auth.user.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>

                        <Link href="/dashboard" prefetch className="flex items-center space-x-2">
                            <div className="flex">
                                <AppLogo />
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="ml-6 hidden h-full items-center space-x-6 lg:flex">
                            <NavigationMenu className="flex h-full items-stretch">
                                <NavigationMenuList className="flex h-full items-stretch space-x-2">
                                    {mainNavItems.map((item, index) => (
                                        item.href ? (
                                            <NavigationMenuItem key={index} className="relative flex h-full items-center">
                                                <Link
                                                    href={item.href}
                                                    className={cn(
                                                        navigationMenuTriggerStyle(),
                                                        page.url === item.href && activeItemStyles,
                                                        'h-9 cursor-pointer px-3',
                                                    )}
                                                >
                                                    {item.icon && <Icon iconNode={item.icon} className="mr-2 h-4 w-4" />}
                                                    {item.title}
                                                </Link>
                                                {page.url === item.href && (
                                                    <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white"></div>
                                                )}
                                            </NavigationMenuItem>
                                        ) : (
                                            <NavigationMenuItem key={index} className="relative flex h-full items-center">
                                                <div
                                                    className={cn(
                                                        navigationMenuTriggerStyle(),
                                                        'h-9 px-3',
                                                    )}
                                                >
                                                    {item.icon && <Icon iconNode={item.icon} className="mr-2 h-4 w-4" />}
                                                    {item.title}
                                                </div>
                                            </NavigationMenuItem>
                                        )
                                    ))}
                                </NavigationMenuList>
                            </NavigationMenu>
                        </div>
                    </div>

                    <div className="flex items-center space-x-1 sm:space-x-2">
                        <div className="relative flex items-center">
                            <Button variant="ghost" size="icon" className="group h-9 w-9 cursor-pointer">
                                <Search className="size-5 opacity-80 group-hover:opacity-100" />
                            </Button>
                            <div className="hidden lg:flex">
                                {rightNavItems.map((item) => (
                                    <TooltipProvider key={item.title} delayDuration={0}>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <a
                                                    href={item.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group text-accent-foreground ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring ml-1 inline-flex h-9 w-9 items-center justify-center rounded-md bg-transparent p-0 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                                                >
                                                    <span className="sr-only">{item.title}</span>
                                                    {item.icon && <Icon iconNode={item.icon} className="size-5 opacity-80 group-hover:opacity-100" />}
                                                </a>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{item.title}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ))}
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="size-10 rounded-full p-1">
                                    <Avatar className="size-8 overflow-hidden rounded-full">
                                        <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <UserMenuContent user={auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            {breadcrumbs.length > 1 && (
                <div className="border-sidebar-border/70 flex w-full border-b">
                    <div className="mx-auto flex h-12 w-full items-center justify-start overflow-x-auto px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
