
# Contributing

- [Contributing](#contributing)
	- [How to contribute](#how-to-contribute)
	- [How to run tests](#how-to-run-tests)

## How to contribute

When contributing to Kitcoin, please ensure that these conditions are met:

- [x] Running `xo` doesn't return any errors
- [x] All new features have tests written
- [x] `master` passes all [tests](#how-to-run-tests).

Also, please follow these guidelines to be courteous to your fellow developers.

- Please don't squash others' commits, it prevents your fellow developers from being credited.
- [Please use tabs to indent.](https://lea.verou.me/2012/01/why-tabs-are-clearly-superior/)
  - `xo` will help you remember this by treating leading spaces as errors.
- Try to comply with `xo`'s rules rather than overriding them, if you can.
  - If you can fix any issues that currently require an override, please do.

## How to run tests

Before running tests, please ensure that all of these conditions are met:

- [x] Docker is installed and `docker run hello-world` succeeds.
  - If your distribution doesn't package docker (*cough* red hat *cough*), see if it packages `moby-engine`, which is just docker but with a different name.
- [x] Docker-compose is installed.
- [x] Your user is in the `docker` group and you have since re-logged in.