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
                    sh 'docker-compose -p app_idle_dev down --remove-orphans || true'
                    sh '''
                        for VAR in POSTGRES_PORT BACKEND_PORT FRONTEND_PORT; do
                            PORT=$(grep -E "^${VAR}=" .env | cut -d= -f2 | tr -d "[:space:]")
                            if [ -n "$PORT" ]; then
                                docker ps -q --filter "publish=${PORT}" | xargs -r docker rm -f || true
                            fi
                        done
                    '''
                    sh 'docker-compose -p app_idle_dev up -d --build'
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
                        ssh -i /var/jenkins_home/.ssh/id_ed25519 -o StrictHostKeyChecking=no alosano@192.168.0.10 '
                            cd ~/repos/app_idle &&
                            git pull origin main &&
                            docker-compose -p app_idle_prd down --remove-orphans || true &&
                            for VAR in POSTGRES_PORT BACKEND_PORT FRONTEND_PORT; do
                                PORT=$(grep -E "^${VAR}=" .env | cut -d= -f2 | tr -d "[:space:]")
                                if [ -n "$PORT" ]; then
                                    docker ps -q --filter "publish=${PORT}" | xargs -r docker rm -f || true
                                fi
                            done &&
                            docker-compose -p app_idle_prd up -d --build
                        '
                    '''
                }
            }
        }

        stage('Sync Develop') {
            when {
                branch 'main'
            }
            steps {
                withCredentials([usernamePassword(credentialsId: 'github-token', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_TOKEN')]) {
                    sh '''
                        git fetch https://$GIT_USER:$GIT_TOKEN@github.com/AlexandreLosano/app_idle.git "+refs/heads/*:refs/remotes/origin/*"
                        git checkout -B develop origin/develop
                        git merge origin/main
                        git push https://$GIT_USER:$GIT_TOKEN@github.com/AlexandreLosano/app_idle.git develop
                    '''
                }
            }
        }

    }
}