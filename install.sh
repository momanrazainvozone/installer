#!/usr/bin/env bash
echo "** Installing Project dependency, It may take some time. **" &&
echo "** Installing Node JS**" &&
sudo cp -r node/{bin,include,lib,share} /usr/
export PATH=/usr/node-v16.18.0-linux-x64/bin:$PATH
echo "**  installing pm2 **" &&
sudo npm i ./pm2-master -g &&
echo "** Installing postgress SQL Server **" &&
cd postgresql && 
sudo ./configure &&
sudo make &&
sudo su &&
sudo make install
echo "** Installing redis server **" &&
cd redis-stable &&
make &&
sudo install make
