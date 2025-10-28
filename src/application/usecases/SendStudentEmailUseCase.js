class SendStudentEmailUseCase {

    constructor(surveyRepository) {
        this.surveyRepository = surveyRepository; 
    }


    async execute(studentEmail,  studentName, surveyName) {
       const response = this.surveyRepository.sendEmailToStudentSurvey(studentEmail, studentName, surveyName)
       return response; 
    }
}

module.exports = SendStudentEmailUseCase