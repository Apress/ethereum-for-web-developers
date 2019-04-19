#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

# Executes cleanup function at script exit.
trap cleanup EXIT

# Kill the ganache instance that we started (if we started one and if it's still running).
cleanup() {
  if [ -n "$ganache_pid" ] && ps -p $ganache_pid > /dev/null; then
    kill $ganache_pid
  fi
}

# Start ganache instance and save pid
start_ganache() {
  ./node_modules/.bin/ganache-cli -p 9545 > /dev/null &
  ganache_pid=$!
}

# Fire up ganache and tests
start_ganache
./node_modules/.bin/react-scripts test "$@"