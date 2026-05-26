import { NavigationLink } from "../../../core/models/sidebar/navigation-link.interface";

export const SIDEBAR_NAVIGATION: NavigationLink[] = [
    {
        id: 'home',
        icon: "home",
        route: "/",
        type: 'route',
        label: "HEADER.ACTIONS.SIDEBAR.HOME"
    },

    {
        id: 'explore',
        icon: "explore",
        route: "/explore",
        type: 'route',
        label: "HEADER.ACTIONS.SIDEBAR.EXPLORE"
    },

    {
        id: 'send',
        icon: "inbox",
        route: "/messages/inbox",
        type: 'route',
        label: "HEADER.ACTIONS.SIDEBAR.MESSAGES"
    },

    {
        id: 'dumps',
        icon: "movie",
        route: "/dumps",
        type: 'route',
        label: "HEADER.ACTIONS.SIDEBAR.DUMPS"
    },

    {
        id: 'search',
        icon: "search",
        route: "/search",
        type: 'panel',
        label: "HEADER.ACTIONS.SIDEBAR.SEARCH"
    },

    {
        id: 'notifications',
        icon: "favorite",
        route: "/",
        type: 'panel',
        label: "HEADER.ACTIONS.SIDEBAR.ALERTS"
    },

    {
        id: 'saves',
        icon: "bookmark_added",
        route: "/saves",
        type: 'route',
        label: "HEADER.ACTIONS.SIDEBAR.SAVES"
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
        id: 'profile',
        icon: "people",
        route: "/",
        type: 'route',
        label: "HEADER.ACTIONS.SIDEBAR.PROFILE"
    },

    {
        id: 'menu',
        icon: "menu",
        route: "/create",
        type: 'menu',
        label: "HEADER.ACTIONS.SIDEBAR.MENU",
        menuOptions: [
            {
                id: 'settings',
                type: 'action',
                label: 'HEADER.ACTIONS.SIDEBAR.MENU_OPTIONS.SETTINGS',
                icon: "settings",
                iconUrl: '',
            },

            {
                id: 'activity',
                type: 'action',
                label: 'HEADER.ACTIONS.SIDEBAR.MENU_OPTIONS.ACTIVITY',
                icon: "analytics",
                iconUrl: '',
            },

            {
                id: 'saves',
                type: 'action',
                label: 'HEADER.ACTIONS.SIDEBAR.MENU_OPTIONS.SAVES',
                icon: "flag",
                iconUrl: '',
            },

            {
                id: 'display',
                type: 'menu',
                label: 'HEADER.ACTIONS.SIDEBAR.MENU_OPTIONS.DISPLAY',
                icon: "brightness_6",
                iconUrl: '',
            },

            {
                id: 'report',
                type: 'action',
                label: 'HEADER.ACTIONS.SIDEBAR.MENU_OPTIONS.REPORT',
                icon: "report",
                iconUrl: '',
            },

            {
                id: 'change-account',
                type: 'action',
                label: 'HEADER.ACTIONS.SIDEBAR.MENU_OPTIONS.CHANGE_ACCOUNT',
                icon: "",
                iconUrl: '',
            },

            {
                id: 'disconnect',
                type: 'action',
                label: 'HEADER.ACTIONS.SIDEBAR.MENU_OPTIONS.DISCONNECT',
                icon: "",
                iconUrl: '',
            }
        ]
    },

    {
        id: 'settings-page',
        icon: "settings",
        route: "/settings",
        type: 'route',
        label: "HEADER.ACTIONS.SIDEBAR.SETTINGS"
    }
];