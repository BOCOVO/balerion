## disable EE if options not set
if [[ -z "$RUN_EE" ]]; then
  export BALERION_DISABLE_EE=true
else
  export BALERION_DISABLE_LICENSE_PING=true
fi

jestOptions=($JEST_OPTIONS)

yarn test:e2e --setup --concurrency=1 -- "${jestOptions[@]}"
