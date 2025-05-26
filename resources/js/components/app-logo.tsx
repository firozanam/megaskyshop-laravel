import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    // Get the app name from environment variables
    const appName = import.meta.env.VITE_APP_NAME || 'Laravel Starter Kit';
    
    return (
        <>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
                <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 leading-none font-semibold whitespace-nowrap">{appName}</span>
            </div>
        </>
    );
}
