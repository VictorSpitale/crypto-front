import {useState, useEffect} from 'react';
import './App.css';
import './home.css';
import {Vault} from "./types/Vault.ts";
import {Password} from "./types/Password.ts";

function App() {
    const [vaults, setVaults] = useState<Vault[]>([]);
    const [unlockedVault, setUnlockedVault] = useState<Vault | null>(null);
    const [newVaultName, setNewVaultName] = useState('');
    const [newVaultPassword, setNewVaultPassword] = useState('');

    useEffect(() => {
        setVaults([{name: "Coffre 1", content: null, id: 1}])
    }, []);

    const handleVaultClick = (vault: Vault) => {
        const password = prompt(`Entrez le mot de passe pour le coffre ${vault.name}:`);
        console.log('Mot de passe saisi:', password);
        setUnlockedVault({
            ...unlockedVault!,
            content: [
                {id: 1, label: 'Site Web', password: 'MotDePasseSite123', visible: false},
                {id: 2, label: 'Email', password: 'MotDePasseEmail456', visible: false},
            ],
        });
    };

    const handleAddVault = () => {
        if (newVaultName.trim() === '' || newVaultPassword.trim() === '') {
            alert('Veuillez remplir tous les champs.');
            return;
        }
        const newVault: Vault = {name: newVaultName, content: null, id: 9};
        setVaults(prevVaults => [...prevVaults, newVault]);
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

    const handleEditPassword = (passwordId: number) => {
        console.log(`Édition du mot de passe avec l'ID ${passwordId}`);
    };

    const handleDeletePassword = (passwordId: number) => {
        console.log(`Suppression du mot de passe avec l'ID ${passwordId}`);
    };

    const addPassword = () => {
        const libelle = prompt('Entrez le libellé du mot de passe:');
        const motDePasse = prompt('Entrez le mot de passe:');

        if (libelle === null || motDePasse === null) {
            console.log('Opération annulée par l\'utilisateur.');
            return;
        }

        const password : Password = { label: libelle, password: motDePasse, visible: false, id: 9 };

        const newVault: Vault = {
            ...unlockedVault!,
            content: unlockedVault?.content ? [...unlockedVault.content, password] : [password],
        };

        setUnlockedVault(newVault)

        console.log('Vault avec le nouveau mot de passe:', newVault);
    }

    return (
        <>
            <h1>Mon keepass</h1>

            <button className={"btn-action blue"} onClick={() => null}>
                Importer
            </button>

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
                    <button className={"btn-action green"} style={{"margin": "15px"}} onClick={() => null}>
                        Exporter
                    </button>

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
