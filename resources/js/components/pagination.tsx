import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
    currentPage: number;
    lastPage: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

export const Pagination: React.FC<PaginationProps> = ({ 
    currentPage, 
    lastPage,
    links 
}) => {
    // If there's only one page, don't show pagination
    if (lastPage <= 1) {
        return null;
    }

    // Filter out the "Next" and "Previous" labels which Laravel adds
    const pageLinks = links.filter(
        link => link.label !== 'Next &raquo;' && link.label !== '&laquo; Previous'
    );

    return (
        <div className="flex items-center justify-center space-x-2">
            {/* Previous page button */}
            <Button
                variant="outline"
                size="icon"
                disabled={currentPage === 1}
                asChild={currentPage !== 1}
            >
                {currentPage === 1 ? (
                    <span>
                        <ChevronLeft className="h-4 w-4" />
                    </span>
                ) : (
                    <Link href={links[0].url || '#'}>
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                )}
            </Button>

            {/* Page numbers */}
            {pageLinks.map((link, i) => {
                // Try to convert the label to a number
                const pageNum = parseInt(link.label);
                
                // If it's not a number (like "..."), render an ellipsis
                if (isNaN(pageNum)) {
                    return (
                        <span key={i} className="flex h-9 w-9 items-center justify-center">
                            <MoreHorizontal className="h-4 w-4" />
                        </span>
                    );
                }
                
                // Otherwise render a page number
                return (
                    <Button
                        key={i}
                        variant={link.active ? "default" : "outline"}
                        size="icon"
                        asChild={!link.active}
                    >
                        {link.active ? (
                            <span>{link.label}</span>
                        ) : (
                            <Link href={link.url || '#'}>
                                {link.label}
                            </Link>
                        )}
                    </Button>
                );
            })}

            {/* Next page button */}
            <Button
                variant="outline"
                size="icon"
                disabled={currentPage === lastPage}
                asChild={currentPage !== lastPage}
            >
                {currentPage === lastPage ? (
                    <span>
                        <ChevronRight className="h-4 w-4" />
                    </span>
                ) : (
                    <Link href={links[links.length - 1].url || '#'}>
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                )}
            </Button>
        </div>
    );
}; 