export function encontrarInscricaoRJ(objeto: any) {
    if (objeto) {
        for (let inscricao of objeto) {
            if (inscricao.estado === "RJ") {
                return inscricao.inscricao_estadual;
            }
        }
    }
    return '';
}