import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Link } from '@inertiajs/react';
import { Fragment, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function Breadcrumbs({ breadcrumbs }: { breadcrumbs: BreadcrumbItemType[] }) {
    const [isMobile, setIsMobile] = useState(false);

    // Handle responsive behavior
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 640);
        };
        
        // Initial check
        checkScreenSize();
        
        // Add event listener for window resize
        window.addEventListener('resize', checkScreenSize);
        
        // Cleanup
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // If on mobile and we have more than 2 breadcrumbs, show only the first and last
    const displayBreadcrumbs = isMobile && breadcrumbs.length > 2
        ? [breadcrumbs[0], breadcrumbs[breadcrumbs.length - 1]]
        : breadcrumbs;

    return (
        <>
            {breadcrumbs.length > 0 && (
                <Breadcrumb>
                    <BreadcrumbList className="flex-wrap">
                        {displayBreadcrumbs.map((item, index) => {
                            const isLast = index === displayBreadcrumbs.length - 1;
                            const isCollapsed = isMobile && breadcrumbs.length > 2 && index === 0;
                            
                            return (
                                <Fragment key={index}>
                                    <BreadcrumbItem>
                                        {isLast ? (
                                            <BreadcrumbPage className={cn(
                                                "max-w-[150px] sm:max-w-[200px] md:max-w-none truncate",
                                                isCollapsed && "max-w-[80px] sm:max-w-[100px]"
                                            )}>
                                                {item.title}
                                            </BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink asChild>
                                                <Link href={item.href} className={cn(
                                                    "max-w-[150px] sm:max-w-[200px] md:max-w-none truncate",
                                                    isCollapsed && "max-w-[80px] sm:max-w-[100px]"
                                                )}>
                                                    {item.title}
                                                </Link>
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                    {!isLast && (
                                        <>
                                            <BreadcrumbSeparator />
                                            {isMobile && breadcrumbs.length > 2 && index === 0 && (
                                                <BreadcrumbItem>
                                                    <BreadcrumbPage className="text-muted-foreground">...</BreadcrumbPage>
                                                </BreadcrumbItem>
                                            )}
                                            {isMobile && breadcrumbs.length > 2 && index === 0 && (
                                                <BreadcrumbSeparator />
                                            )}
                                        </>
                                    )}
                                </Fragment>
                            );
                        })}
                    </BreadcrumbList>
                </Breadcrumb>
            )}
        </>
    );
}
