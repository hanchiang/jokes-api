#!/usr/bin/env bash 

idleTimeoutMillis=1000
env=$1

NODE_ENV=${env} node $JOKES_API/db/scripts/insert.js ${idleTimeoutMillis}