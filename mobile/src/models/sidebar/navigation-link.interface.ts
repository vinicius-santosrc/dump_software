export type SidebarItemType =
    | 'route'
    | 'panel'
    | 'menu'
    | 'action';

export interface SidebarMenuOption {
    id: string;
    label: string;
    icon: string;
    iconUrl?: string;
    type?: SidebarItemType;
    route?: string;
}

export interface NavigationLink {
    id: string;
    icon: string;
    iconUrl?: string;
    route?: string;
    label: string;
    type: SidebarItemType;
    menuOptions?: SidebarMenuOption[];
}