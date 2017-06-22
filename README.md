# redirector
Performs 301-redirects on a source and target url. It uses a redis-backed cache to store redirect information and record statistics on redirects performed.

To start:
1. Rename .env-sample to .env and set appropriate values
2. Start up and call http://<Domain>/refresh to load in values from redirects.csv
3. Wait for the magic to happen
