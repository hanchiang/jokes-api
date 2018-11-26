#!/usr/bin/env bash 

idleTimeoutMillis=1000
node $JOKES_API/db/scripts/deleteTables.js ${idleTimeoutMillis}
echo
node $JOKES_API/db/scripts/createTables.js ${idleTimeoutMillis}
echo
node $JOKES_API/db/scripts/insert.js ${idleTimeoutMillis}