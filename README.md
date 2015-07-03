Full-Stack Challenge
=========================
[![Dependency Status](https://david-dm.org/chesleybrown/full-stack-challenge.svg)](https://david-dm.org/chesleybrown/full-stack-challenge)
[![devDependency Status](https://david-dm.org/chesleybrown/full-stack-challenge/dev-status.svg)](https://david-dm.org/chesleybrown/full-stack-challenge#info=devDependencies)

The assignment is to build a simple Producer/Consumer system. In this system the
Generator will send a series of random arithmetic expressions, while the
Evaluator will accept these expressions, compute the result and then report the
solution to the Generator.

## Requires

- NodeJS
- npm

## Setup

1. Run `npm install`

## Running the Consumer

The Consumer service listens for expressions from any Producers. Upon receiving
an expression, it will attempt to evaluate it. If it's successful, it will emit
an event back to the Producer with the answer. It will also emit the answer to
the public event feed. If it can't evaluate the expression, it will broadcast
an error instead.

1. Run `npm run consumer`

Once the Consumer is running you can visit http://localhost:3000/ in a modern
browser and get the expression interface. This page will be automatically
updated as expressions from any Producers are evaluated as well as when
expressions fail to be evaluated.

The Consumer will log all of it's output to stdout.

## Running a Producer

The Producer service will generate a random arithmetic expression consiting of
two integers and an operator, e.g. "2+3=". It will do this every second until
the end of time (or until you stop the process, whichever comes first). You can
run as many Producer processes as your computer will support.

1. Run `npm run producer`

The Producer will log all of it's output to stdout.

## Running Tests

Use the `npm test` command. This will validate the codestyle of the project
using the `tabs4life` coding standard as well as run all tests in the `test`
directory.
