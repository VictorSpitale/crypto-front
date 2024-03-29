import {Password} from "./Password.ts";

export type Vault = {
    id: number;
    name: string;
    content: Password[] | null
}

export type UnlockedVault = Vault & {
    password: string;
}

export type VaultDTO = Pick<Vault, "name"> & {
    password: string;
}