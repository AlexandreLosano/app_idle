pipeline {
    agent any

    triggers {
        pollSCM('* * * * *')
    }

    stages {
        stage('Deploy Develop') {
            when {
                branch 'develop'
            }
            steps {
                withCredentials([file(credentialsId: 'app-idle-env', variable: 'ENV_FILE')]) {
                    sh 'cp $ENV_FILE .env'
                    sh 'docker-compose up -d --build'
                }
            }
        }
    }
}