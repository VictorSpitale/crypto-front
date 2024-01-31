type BasePassword = {
    id: number;
    label: string;
    password: string;
}

export type Password = BasePassword & {
    visible: boolean;
}

type VaultInformation = {
    id: number;
    vaultPassword: string;
}

export type PasswordDTO = BasePassword & VaultInformation

export type DeletePasswordDTO = {
    passwordId: number
} & VaultInformation

export type EditPasswordDTO = {
    passwordId: number,
    password: string
} & VaultInformation
