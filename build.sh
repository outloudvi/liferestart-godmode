#!/bin/bash
rm -r src/vendor/utils
rm -r src/vendor/test
npm ci
npm run build
