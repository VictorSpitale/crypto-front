import {Password} from "./Password.ts";

export type Vault = {
    id: number;
    name: string;
    content: Password[] | null
}