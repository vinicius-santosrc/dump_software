import { environment } from "../../../environments/environments";
import { environment_prod } from "../../../environments/environments.prod";

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
