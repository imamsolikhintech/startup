pipeline {
    agent any

    environment {
        GIT_REPO = 'https://github.com/imamsolikhintech/startup.git'
        GIT_BRANCH = 'naiveui'
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: env.GIT_BRANCH, url: env.GIT_REPO
            }
        }

        stage('Build and Push Docker Images') {
            steps {
                script {
                    // Build and push auth-service image
                    dir('backend/auth-service') {
                        sh 'docker build -t auth-service:latest .'
                        // Add docker push command here if you have a registry
                        // sh 'docker push auth-service:latest'
                    }
                    // Build and push frontend image
                    dir('frontend') {
                        sh 'docker build -t frontend:latest .'
                        // Add docker push command here if you have a registry
                        // sh 'docker push frontend:latest'
                    }
                }
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                script {
                    sh "docker-compose -f ${DOCKER_COMPOSE_FILE} down --remove-orphans || true"
                    sh "docker-compose -f ${DOCKER_COMPOSE_FILE} up -d --build"
                }
            }
        }

        stage('Clean Up') {
            steps {
                script {
                    sh 'docker system prune -f'
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
        success {
            echo 'Pipeline succeeded.'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}