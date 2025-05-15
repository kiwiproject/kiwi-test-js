### KiwiTestJS
[![Build](https://github.com/kiwiproject/kiwi-test-js/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/kiwiproject/kiwi-test-js/actions/workflows/build.yml?query=branch%3Amain)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=kiwiproject_kiwi-test-js&metric=alert_status)](https://sonarcloud.io/dashboard?id=kiwiproject_kiwi-test-js)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=kiwiproject_kiwi-test-js&metric=coverage)](https://sonarcloud.io/dashboard?id=kiwiproject_kiwi-test-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM](https://img.shields.io/npm/v/@kiwiproject/kiwi-test-js)](https://www.npmjs.com/package/@kiwiproject/kiwi-test-js)

kiwi-test-js is a test utility library. Most of these utilities are ports from the Java Kiwi-test library (https://github.com/kiwiproject/kiwi-test).

### TestContainers
There are a few prebuilt implementations of starting up TestContainers to use in tests. These utilities allow for global
setup and teardown methods to be created to run containers before all tests and after all tests not just per test file.
Currently there are 4 implementations:

* PostgresExtension - Spins up and shuts down a Postgres container for use and allows for creating databases
* MongoExtension - Spins up and shuts down a Mongo container for use
* ElasticSearchExtension - Spins up and shuts down a Elastic Search container for use
* MinioExtension - Spins up and shuts down a Minio container for use
