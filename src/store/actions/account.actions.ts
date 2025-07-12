import axios from "axios";
import Cookies from "js-cookie";
import {addNotification} from "./notifications.action";

export const LOG_IN: string = "LOG_IN";
export const REGISTER: string = "REGISTER";
export const LOG_OUT: string = "LOG_OUT";

const instance = axios.create({
    baseURL: `${process.env.REACT_APP_API_PROTOCOL || 'http'}://${process.env.REACT_APP_API_URL}`,
    timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '5000'),
    headers: {
        'Content-Type': 'application/json'
    }
});

export function me(): any {

    return async (dispatch : any) => {
        try {
            const response = await instance.get('/auth/me', {
                headers: {
                    auth: Cookies.get('token')
                }
            });
            return dispatch({type: LOG_IN, email: response.data.username});
        } catch (e) {
            if ((e as any).response === undefined) {
                return dispatch(addNotification("Error", (e as any).message));
            }
            return dispatch(addNotification("Error", "Session expired"));
        }
    }
}


export function login(email: string, password: string): any {

    return async (dispatch : any) => {
        try {
            const response = await instance.post('/auth/login', {
                username: email,
                password: password
            });
            Cookies.set('token', response.data.token);
            return dispatch({type: LOG_IN, email: email});
        } catch (e) {
            if ((e as any).response === undefined) {
                return dispatch(addNotification("Error", (e as any).message));
            }
            return dispatch(addNotification("Error", (e as any).response.data));
        }
    }
}

export function register(email: string, password: string): any {

    return async (dispatch : any) => {
        try {
            const response = await instance.post('/auth/register', {
                username: email,
                password: password
            });

            dispatch(addNotification("Success", response.data));
            return dispatch({type: REGISTER});
        } catch (e) {
            if ((e as any).response === undefined) {
                return dispatch(addNotification("Error", (e as any).message));
            }
            console.log((e as any).response.data);
            if ((e as any).response.data && Array.isArray((e as any).response.data) && (e as any).response.data.length > 0) {
                const firstError = (e as any).response.data[0];
                if (firstError && firstError.constraints) {
                    const constraintKeys = Object.keys(firstError.constraints);
                    if (constraintKeys.length > 0) {
                        return dispatch(addNotification("Error", firstError.constraints[constraintKeys[0]]));
                    }
                }
            }
            return dispatch(addNotification("Error", (e as any).response.data));
        }
    }
}

export function logout(): ILogOutActionType {
    return { type: LOG_OUT};
}

interface ILogInActionType { type: string, email: string };
interface ILogOutActionType { type: string };
