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

        stage('Deploy Production') {
            when {
                branch 'main'
            }
            steps {
                withCredentials([
                    file(credentialsId: 'app-idle-env', variable: 'ENV_FILE')
                ]) {
                    sh '''
                        ssh -i /var/jenkins_home/.ssh/id_ed25519 -o StrictHostKeyChecking=no alosano@192.168.0.10 "
                            cd ~/repos/app_idle &&
                            git pull origin main &&
                            docker-compose up -d --build
                        "
                    '''
                }
            }
        }
    }
}