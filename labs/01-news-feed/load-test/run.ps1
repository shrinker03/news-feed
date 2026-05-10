# Run from this directory. Backend must be running on :3001.
# Usage: .\run.ps1
# With fail rate: $env:FAIL_RATE=0.2; cd ../backend; npm run dev  (stage 2+)
npx autocannon -c 100 -d 20 "http://localhost:3001/api/posts?limit=20"
