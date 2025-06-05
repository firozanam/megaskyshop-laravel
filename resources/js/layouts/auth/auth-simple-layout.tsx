import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="bg-background flex min-h-svh flex-col items-center justify-center p-4 sm:p-6 md:p-10">
            <div className="w-full max-w-sm px-2 sm:px-0">
                <div className="flex flex-col gap-6 sm:gap-8">
                    <div className="flex flex-col items-center gap-3 sm:gap-4">
                        <Link href={route('home')} className="flex flex-col items-center gap-2 font-medium">
                            <div className="mb-1 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-md">
                                <AppLogoIcon className="size-8 sm:size-9 fill-current text-[var(--foreground)] dark:text-white" />
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-1 sm:space-y-2 text-center">
                            <h1 className="text-lg sm:text-xl font-medium">{title}</h1>
                            <p className="text-muted-foreground text-center text-xs sm:text-sm">{description}</p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
