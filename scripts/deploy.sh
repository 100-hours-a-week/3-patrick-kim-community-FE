#!/bin/bash

# 로그 파일 생성
LOG_FILE="/home/ubuntu/deploy.log"
exec > >(tee -a $LOG_FILE) 2>&1

echo "=== 배포 시작: $(date) ==="

ECR_URI="__ECR_REPO_URI__"
CONTAINER_NAME="my-fe-app"

echo "AWS ECR 로그인 시도 중..."
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin $ECR_URI
if [ $? -ne 0 ]; then
    echo "ECR 로그인 실패!"
    exit 1
fi

echo "Docker Image Pulling..."
docker pull $ECR_URI:latest

if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo "기존 컨테이너 중지..."
    docker stop $CONTAINER_NAME
fi

if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    echo "기존 컨테이너 삭제..."
    docker rm $CONTAINER_NAME
fi

echo "새 컨테이너 실행..."
docker run -d -p 80:3000 --name $CONTAINER_NAME $ECR_URI:latest

echo "=== 배포 완료: $(date) ==="
