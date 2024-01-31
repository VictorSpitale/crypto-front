import React, {useState, useEffect} from 'react';
import './App.css';
import './home.css';
import {UnlockedVault, Vault, VaultDTO} from "./types/Vault.ts";
import {DeletePasswordDTO, EditPasswordDTO, Password, PasswordDTO} from "./types/Password.ts";

function App() {
    const [vaults, setVaults] = useState<Vault[]>([]);
    const [unlockedVault, setUnlockedVault] = useState<UnlockedVault | null>(null);
    const [newVaultName, setNewVaultName] = useState('');
    const [newVaultPassword, setNewVaultPassword] = useState('');

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                if (typeof window !== 'undefined' && isMounted) {
                    const response = await fetch("http://localhost:3000/vault", {
                        method: "GET"
                    });

                    if (response.ok && isMounted) {
                        const data = await response.json();
                        setVaults(data);
                    }
                }
            } catch (error) {
                console.error('Erreur lors de la requête à l\'API:', error);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleVaultClick = async (vault: Vault) => {
        const password = prompt(`Entrez le mot de passe pour le coffre ${vault.name}:`);

        const response = await fetch(`http://localhost:3000/vault?id=${vault.id}&password=${password}`, {
            method: "GET"
        });

        const data = await response.json();

        if(response.ok) {
            setUnlockedVault({...data, password});
        } else {
            alert(data.error);
        }

    };

    const handleAddVault = async () => {
        if (newVaultName.trim() === '' || newVaultPassword.trim() === '') {
            alert('Veuillez remplir tous les champs.');
            return;
        }
        // request POST Vault /vault
        // body VaultDTO

        const response = await fetch("http://localhost:3000/vault", {
            method: "POST",
            headers: {
                "Content-Type": "application/json" // Assurez-vous de définir correctement le type de contenu
            },
            body: JSON.stringify({
                name: newVaultName,
                password: newVaultPassword
            } as VaultDTO)
        });

        const data = await response.json();

        if(response.ok) {
            setVaults(prevVaults => [...prevVaults, data]);
        } else {
            alert(data.error);
        }

        setNewVaultName('');
        setNewVaultPassword('');
    };

    const togglePasswordVisibility = (passwordId: number) => {
        
        setUnlockedVault((prevUnlockedVault) => {
            if (!prevUnlockedVault) {
                return prevUnlockedVault;
            }

            const updatedContent: Password[] | null = prevUnlockedVault.content
                ? prevUnlockedVault.content.map((password) =>
                    password.id === passwordId
                        ? {...password, visible: !password.visible}
                        : password
                )
                : null;

            return {...prevUnlockedVault, content: updatedContent};
        });
    };

    const handleEditPassword = async (passwordId: number) => {
        const password = prompt(`Entrez le nouveau mot de passe`);

        if(!password) return;

        const response = await fetch("http://localhost:3000/password", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json" // Assurez-vous de définir correctement le type de contenu
            },
            body: JSON.stringify({
                vaultPassword: unlockedVault?.password,
                passwordId,
                id: unlockedVault?.id,
                password
            } as EditPasswordDTO)
        })

        const data = await response.json();

        if(response.ok) {
            setUnlockedVault({
                ...unlockedVault!,
                content: data.content
            })
        } else {
            alert(data.error)
        }
    };

    const handleDeletePassword = async (passwordId: number) => {
        const response = await fetch("http://localhost:3000/password", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json" // Assurez-vous de définir correctement le type de contenu
            },
            body: JSON.stringify({
                vaultPassword: unlockedVault?.password,
                passwordId,
                id: unlockedVault?.id
            } as DeletePasswordDTO)
        })

        const data = await response.json();

        if(response.ok) {
            setUnlockedVault({
                ...unlockedVault!,
                content: data.content
            })
        } else {
            alert(data.error)
        }
    };

    const addPassword = async () => {
        // request POST /password
        // body PasswordDTO
        const libelle = prompt('Entrez le libellé du mot de passe:');
        const motDePasse = prompt('Entrez le mot de passe:');

        if (libelle === null || motDePasse === null) {
            console.log('Opération annulée par l\'utilisateur.');
            return;
        }

        const response = await fetch("http://localhost:3000/password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json" // Assurez-vous de définir correctement le type de contenu
            },
            body: JSON.stringify({
                id: unlockedVault?.id,
                label: libelle,
                password: motDePasse,
                vaultPassword: unlockedVault?.password
            } as PasswordDTO)
        });

        const data = await response.json();

        if(response.ok) {
            setUnlockedVault({
                ...unlockedVault!,
                content: data.content
            });
        } else {
            alert(data.error)
        }

    }

    const importFile = async (password: string) => {
        const input = document.createElement('input');
        input.type = 'file';

        // Utilisez une promesse pour attendre la sélection du fichier
        const file = await new Promise((resolve) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            input.addEventListener('change', (event: React.ChangeEvent<HTMLInputElement>) => {
                const selectedFile = event.target?.files![0];
                resolve(selectedFile);
            });

            input.style.display = 'none';

            // Ajoutez l'input au DOM
            document.body.appendChild(input);

            // Cliquez sur l'input pour ouvrir le sélecteur de fichiers
            input.click();
        });

        // Supprimez l'input du DOM après la sélection du fichier
        document.body.removeChild(input);

        if (file) {
            console.log(file, password)
            try {
                const formData = new FormData();
                formData.append('vault', file as File);

                const response = await fetch(`http://localhost:3000/vault/import?password=${password}`, {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();

                if (response.ok) {
                    console.log('Fichier téléchargé avec succès !');
                    setVaults([...vaults, data])
                } else {
                    console.error('Erreur lors de la requête API:', response.status);
                }
            } catch (error) {
                console.error('Erreur lors de la requête API:', error);
            }
        } else {
            console.log('Aucun fichier sélectionné.');
        }
    }

    const importVault = async () => {
        const password = prompt('Entrez le mot de passe');

        if(!password) {
            return;
        }

        await importFile(password);

    }

    const exportVault = async () => {
        const response = await fetch(`http://localhost:3000/vault/export?id=${unlockedVault?.id}&password=${unlockedVault?.password}`, {
            method: "GET"
        });

        const data = await response.json();

        if(response.ok) {
            const jsonString = JSON.stringify(data, null, 2);

            const blob = new Blob([jsonString], { type: 'application/json' });

            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `vault-${unlockedVault?.name}.json`;
            document.body.appendChild(a);

            a.click();

            document.body.removeChild(a);

            URL.revokeObjectURL(url);
        }
    }

    return (
        <>
            <h1>Mon keepass</h1>

            <button className={"btn-action blue"} id={"fileInput"} onClick={() => importVault()} >Importer</button>

            <ul>
                {vaults.map((vault, index) => (
                    <li key={index} onClick={() => handleVaultClick(vault)}>
                        {vault.name}
                    </li>
                ))}
            </ul>

            {unlockedVault ? (
                <>
                    <h2>Coffre déverrouillé: {unlockedVault.name}</h2>

                    <button className={"btn-action blue"} onClick={() => addPassword()}>
                        Ajouter
                    </button>
                    <button className={"btn-action green"} style={{"margin": "15px"}} onClick={() => exportVault()}>
                        Exporter
                    </button>

                    {!!unlockedVault && (unlockedVault.content?.length ?? 0) > 0 ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>Libellé</th>
                                    <th>Mot de passe</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!!unlockedVault.content && unlockedVault.content.map((password) => (
                                    <tr key={password.id}>
                                        <td>{password.label}</td>
                                        <td>{password.visible ? password.password : '********'}</td>
                                        <td>
                                            <button className={"btn-action green"} onClick={() => togglePasswordVisibility(password.id)}>
                                                {password.visible ? 'Cacher' : 'Afficher'}
                                            </button>
                                            <button className={"btn-action blue"} onClick={() => handleEditPassword(password.id)}>
                                                Modifier
                                            </button>
                                            <button className={"btn-action red"} onClick={() => handleDeletePassword(password.id)}>
                                                Supprimer
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>Aucun mot de passe enregistré</p>
                    )}
                </>
            ) : (
                <div className="form-container">
                    <h2>Ajouter un nouveau coffre</h2>
                    <label htmlFor="vaultName">Nom du coffre:</label>
                    <input
                        type="text"
                        id="vaultName"
                        value={newVaultName}
                        onChange={(e) => setNewVaultName(e.target.value)}
                    />

                    <label htmlFor="vaultPassword">Mot de passe du coffre:</label>
                    <input
                        type="password"
                        id="vaultPassword"
                        value={newVaultPassword}
                        onChange={(e) => setNewVaultPassword(e.target.value)}
                    />

                    <button onClick={handleAddVault}>Ajouter</button>
                </div>
            )}
        </>
    );
}

export default App;
