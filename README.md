# metalog
MetaMask - based login API w/o database for creating client-server apps that interact with a chain. note that **server-side seed must be private** (in `server/app.py`)

front-end is very basic react, back-end is flask api.

loosely based on (one-click metamask login)[https://www.toptal.com/ethereum/one-click-login-flows-a-metamask-tutorial], generates a signed login token with the following information:
- time of login
- address
- signature 
- hash including server-side seed generated at login-time (so that time of login cannot be spoofed too much) 

back-end app has a method `verify_token` that checks that token is valid and that can be modified to extract the address (which is just `"0x" + token[8:48]` anyway)

in theory we could have  "last server timestamp" saved for each address to prevent timestamp spoofing as well.
