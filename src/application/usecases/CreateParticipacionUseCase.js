class CreateParticipacionUseCase {
    constructor(participacionRepositrory) {
        this.participacionRepositrory = participacionRepositrory;
    }

    async execute(data) {

        try {

            if(!data.id_encuesta) {
                throw new Error("el id de la encuesta es obligatorio")
            }

            const response = await this.participacionRepositrory.create(data)

            if(!response) {
                throw new Error("error to create participacion")
            }

            return response
        } catch (error) {
            await t.rollback();
            console.error('💥 Error al crear participación(es):', error);
            throw error;
        }
    }
}

module.exports = CreateParticipacionUseCase;