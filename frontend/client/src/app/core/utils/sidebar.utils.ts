import { NavigationLink } from "../models/sidebar/navigation-link.interface";

export class SidebarUtils {

    static resolveProfileNavigation(
        item: NavigationLink,
        user: any
    ): NavigationLink {
        if (item.id !== 'profile') {
            return item;
        }

        return {
            ...item,
            iconUrl: user?.profilePictureUrl || '',
            route: `/${user?.username || 'profile'}`
        };
    }
}