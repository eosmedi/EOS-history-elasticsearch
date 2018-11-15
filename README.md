# EOS-history-elasticsearch
Use fibos emitter plugin as action data source


## Install FIBOS
FIBOS is fully compatible with eos

```shell
curl -s https://fibos.io/download/installer_beta.sh | sh
```

## Run Elasticsearch cluster
```shell
sudo docker-compose up -d
```

## Start Node

```shell
nohup fibos node-file.js > run.log &
```

## Install Kibana
```shell
wget https://artifacts.elastic.co/downloads/kibana/kibana-6.4.0-linux-x86_64.tar.gz
tar zxvf kibana-6.4.0-linux-x86_64.tar.gz
cd kibana-6.4.0-linux-x86_64
bin/kibana
```

## Start Importer
```shell
node importer.js
```