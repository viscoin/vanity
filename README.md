## Viscoin vanity address generator

### Usage
Install packages and compile typescript.
```
npm run setup
```
Create a `.env` file in the root of the project. Set filter to what the address should start with. Multiple targets are separated by space.
```
filter=fast ninja
threads=0
```
Start searching...
```
node .
```
#### Important
The difficulty of finding an address that matches your target increases exponentially as you add more characters.