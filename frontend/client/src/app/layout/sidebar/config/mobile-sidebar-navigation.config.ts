import { NavigationLink } from "../../../core/models/sidebar/navigation-link.interface";

export const MOBILE_SIDEBAR_NAVIGATION: NavigationLink[] = [
    {
        id: 'home',
        icon: "home",
        route: "/",
        type: 'route',
        label: "HEADER.ACTIONS.SIDEBAR.HOME"
    },

    {
        id: 'dumps',
        icon: "movie",
        route: "/dumps",
        type: 'route',
        label: "HEADER.ACTIONS.SIDEBAR.DUMPS"
    },

    {
        id: 'create',
        icon: "add_circle",
        route: "/create",
        type: 'action',
        label: "HEADER.ACTIONS.SIDEBAR.ADD_POST"
    },

    {
        id: 'search',
        icon: "search",
        route: "/search",
        type: 'panel',
        label: "HEADER.ACTIONS.SIDEBAR.SEARCH"
    },

    {
        id: 'profile',
        icon: "person",
        route: "/profile",
        type: 'route',
        label: "HEADER.ACTIONS.SIDEBAR.PROFILE"
    }
];