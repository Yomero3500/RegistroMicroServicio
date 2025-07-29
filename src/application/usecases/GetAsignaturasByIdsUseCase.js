class GetAsignaturasByIdsUseCase {
    constructor(asignaturaRepository) {
        this.asignaturaRepository = asignaturaRepository;
    }

    async execute(asignaturaIds) {
        try {
            const asignaturas = await this.asignaturaRepository.findByIds(asignaturaIds);
            return asignaturas;
        } catch (error) {
            throw new Error('Error al obtener las asignaturas: ' + error.message);
        }
    }
}

module.exports = GetAsignaturasByIdsUseCase;
