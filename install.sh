#!/usr/bin/env bash
echo "** Installing Project dependency, It may take some time. **" &&
echo "** Installing Node JS**" &&
sudo cp -r node-v16.18.0-linux-x64/{bin,include,lib,share} /usr/ &&
export PATH=/usr/node-v16.18.0-linux-x64/bin:$PATH
echo "**  installing pm2 **" &&
sudo npm i ./pm2
echo "** Installing redis server **" &&
cd redis-stable && make && sudo install make && cd ..
echo "** Installing postgress SQL Server **"
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list' && 
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add - && 
sudo apt-get -y install postgresql
