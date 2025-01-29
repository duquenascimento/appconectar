export function encontrarInscricaoRJ(objeto: any): string | null {
    if (objeto) {
        for (let inscricao of objeto) {
            if (inscricao.estado === "RJ") {
                return inscricao.inscricao_estadual;
            }
        }
    }
    return null;
}