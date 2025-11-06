class AnswerController {
    constructor(createUseCase, listAllUseCase, updateUseCase, deleteUseCase) {
        this.createUseCase = createUseCase;
        this.listAllUseCase = listAllUseCase;
        this.updateUseCase = updateUseCase;
        this.deleteUseCase = deleteUseCase;
    }

    async create(req, res) {
        try {
            const { id_pregunta, id_participacion, respuesta_texto } = req.body;

            if (!id_pregunta || !id_participacion) {
                return res.status(400).json({ success: false, message: 'id_pregunta e id_participacion son obligatorios' });
            }

            const answer = await this.createUseCase.run(id_pregunta, id_participacion, respuesta_texto);
            return res.status(201).json({ success: true, data: answer });
        } catch (error) {
            console.error('Error al crear respuesta:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async listAll(req, res) {
        try {
            const answers = await this.listAllUseCase.run();
            return res.status(200).json({ success: true, total: answers.length, data: answers });
        } catch (error) {
            console.error('Error al listar respuestas:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async update(req, res) {
        try {
            const { id_respuesta } = req.params;
            const { respuesta_texto } = req.body;

            const updated = await this.updateUseCase.run(Number(id_respuesta), respuesta_texto);
            return res.status(200).json({ success: true, data: updated });
        } catch (error) {
            console.error('Error al actualizar respuesta:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async delete(req, res) {
        try {
            const { id_respuesta } = req.params;

            const deleted = await this.deleteUseCase.run(Number(id_respuesta));
            return res.status(200).json({ success: true, deleted });
        } catch (error) {
            console.error('Error al eliminar respuesta:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = AnswerController;
