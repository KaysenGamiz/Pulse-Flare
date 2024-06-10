function turno_check(data) {
    const horaParts = data.split(':');
    const hora = parseInt(horaParts[0]);
    const minutos = parseInt(horaParts[1]);

    if (hora > 18 || (hora === 18 && minutos > 0)) {
        return "Vespertino";
    } else {
        return "Matutino";
    }
}