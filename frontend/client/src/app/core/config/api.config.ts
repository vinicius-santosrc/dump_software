import { environment } from "../../../environments/environments";

export const API_CONFIG = {
    baseUrl: environment.apiUrl
};

export const WHITE_LIST_ROUTES = [
    "/accounts/signin",
    "/accounts/signup",
    "/accounts/forgotpassword",
    "/memories",
    // "/messages/inbox"
]

export const WHITE_LIST_NAVIGATIONS = [
    '/memories',
    // "/messages/inbox"
    
]
