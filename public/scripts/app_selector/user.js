export async function getUserPermissions() {
    const response = await fetch('/login/permissions');
    if (response.status !== 200) {
        throw new Error('No autorizado');
    }
    const data = await response.json();
    
    // Extraer las llaves (permisos) que son verdaderas
    const permissionsArray = Object.keys(data.permissions).filter(permission => data.permissions[permission]);

    return permissionsArray;
}


export async function getUserName() {
    const response = await fetch('/login/username');
    if (response.status !== 200) {
        throw new Error('No autorizado');
    }
    const data = await response.json();
    return data.username;
}