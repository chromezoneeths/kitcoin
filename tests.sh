#!/bin/bash
docker-compose -f docker-compose.yml -f docker-compose.test.yml build
docker-compose -f docker-compose.yml -f docker-compose.test.yml up test
docker-compose -f docker-compose.yml -f docker-compose.test.yml down