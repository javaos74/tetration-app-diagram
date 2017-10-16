# Tetration Application Dependency Diagram

## installation guide ( tested on Ubuntu 16.10)
```
#remove 4.x nodejs if installed 
$ sudo apt remove nodejs 
$ curl -sL https://deb.nodesource.com/setup_6.x -o nodesource_setup.sh
$ sudo bash nodesource_setup.sh
$ sudo apt-get install nodejs build-essential

#clone repository 
$ git clone https://github.com/javaos74/tetration-app-diagram
$ cd tetration-app-diagram 
$ npm install 
```

## modify credentials.js 
update routes/credentials.js with your tetration cluster & api key, api secret 


## just run & try to use it 
```
$ cd tetration-app-diagram 
$ npm start

```
Open your brower and connect server( or localhost) with 3003 port 

After selection application the you can see Application topology diagram with D3 javascript library 



