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
        id: 'search',
        icon: "explore",
        route: "/explore",
        type: 'route',
        label: "HEADER.ACTIONS.SIDEBAR.SEARCH"
    },

    {
        id: 'create',
        icon: "add_circle",
        route: "/create",
        type: 'menu',
        label: "HEADER.ACTIONS.SIDEBAR.ADD_POST",
        menuOptions: [
            {
                id: 'post',
                type: 'action',
                label: 'HEADER.ACTIONS.SIDEBAR.ADD_POST_MENU.POST',
                icon: "edit",
                iconUrl: '',
            },

            {
                id: 'live',
                type: 'action',
                label: 'HEADER.ACTIONS.SIDEBAR.ADD_POST_MENU.LIVE',
                icon: "videocam",
                iconUrl: '',
            },

            {
                id: 'ad',
                type: 'action',
                label: 'HEADER.ACTIONS.SIDEBAR.ADD_POST_MENU.AD',
                icon: "campaign",
                iconUrl: '',
            },

            {
                id: 'ia',
                type: 'action',
                label: 'HEADER.ACTIONS.SIDEBAR.ADD_POST_MENU.IA',
                icon: "smart_toy",
                iconUrl: '',
            }
        ]
    },

    {
        id: 'inbox',
        icon: "inbox",
        route: "/activity/inbox",
        type: 'route',
        label: "HEADER.ACTIONS.SIDEBAR.INBOX"
    },

    {
        id: 'profile',
        icon: "person",
        route: "/profile",
        type: 'route',
        label: "HEADER.ACTIONS.SIDEBAR.PROFILE"
    }
];