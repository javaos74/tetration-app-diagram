# Tetration Application Dependency Diagram

## Ubuntu installation guide ( tested on Ubuntu 16.10)
```
# remove 4.x nodejs if installed 
$ sudo apt remove nodejs 
$ curl -sL https://deb.nodesource.com/setup_6.x -o nodesource_setup.sh
$ sudo bash nodesource_setup.sh
$ sudo apt-get install nodejs build-essential

# clone repository 
$ git clone https://github.com/javaos74/tetration-app-diagram
$ cd tetration-app-diagram 
$ npm install 
```
## CentOS installation guide ( tested on CentOS 7.x) 
```
#remove 4.x nodejs if installed
$ yum erase nodejs or yum erase node 
$ curl --silent --location https://rpm.nodesource.com/setup_6.x | sudo bash - 
$ sudo yum -y install nodejs 
$ sudo yum -y install gcc-c++ make (if development environment required) 

# clone repository 
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

## change service port from 3003 
```
$ export PORT={port_number} 
$ npm start 
or 
$ vi bin/www and update line 15 
var port = normalizePort(process.env.PORT || '3003');
```

After selection application the you can see Application topology diagram with D3 javascript library 


	

