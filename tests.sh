#!/bin/bash
docker-compose -f docker-compose.yml -f docker-compose.test.yml build
docker-compose -f docker-compose.yml -f docker-compose.test.yml up --exit-code-from test test
EXIT=$?
docker-compose -f docker-compose.yml -f docker-compose.test.yml down
exit $EXIT