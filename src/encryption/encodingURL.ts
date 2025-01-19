import { decryptString, encryptString } from "./crypto"

export const encodeURIParams = (params: string) => {
    return encodeURIComponent(encryptString(params))
}

export const decodeURIParams = (params: string) => {
    return decryptString(decodeURIComponent(params));
}