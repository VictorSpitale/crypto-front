type BasePassword = {
    id: number;
    label: string;
    password: string;
}

export type Password = BasePassword & {
    visible: boolean;
}

type VaultId = {
    vaultId: number;
}

export type PasswordDTO = BasePassword & VaultId


export type DeletePasswordDTO = Pick<Password, "id"> & VaultId
