pipeline {
    agent any

    triggers {
        pollSCM('* * * * *') // verifica a cada 1 minuto
    }

    stages {
        stage('Deploy Develop') {
            when {
                branch 'develop'
            }
            steps {
                sh 'docker-compose up -d --build'
            }
        }
    }
}