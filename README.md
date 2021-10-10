## Viscoin vanity address generator

### Usage
Install packages and compile typescript.
```
npm run setup
```
Create a `.env` file in the root of the project. Set target to what the address should start with.
```
target=abc
```
Start searching...
```
node .
```
#### Important
The difficulty of finding an address that matches your target increases exponentially as you add more characters.