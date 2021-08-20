# metalog
MetaMask - based login API w/o database, front-end is very basic react, back-end is flask api.

loosely based on (one-click metamask login)[https://www.toptal.com/ethereum/one-click-login-flows-a-metamask-tutorial], generates a signed login token with the following information:
- time of login
- signature 
- hash including server-side seed generated at login-time (so that time of login cannot be spoofed too much) 

in theory we could have  "last server timestamp" saved for each address to prevent timestamp spoofing as well.
