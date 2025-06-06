#!/bin/bash
EXPECTED="3"
ACTUAL=$(py compute.py)

if [ "$ACTUAL" == "$EXPECTED" ]; then
  echo "Test OK : $ACTUAL"
  exit 0
else
  echo "Test KO : resulat $ACTUAL au lieu de $EXPECTED"
  exit 1
fi
