# EOS-history-elasticsearch[WIP]
Use fibos emitter plugin as action data source
![Image text](https://raw.githubusercontent.com/lljxx1/EOS-history-elasticsearch/master/diagram.png)


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


## Start API
```shell
node app.js
```
demo api docs https://history.votetracker.io/documentation

# API List

### /v1/history/get_actions

- **Params**：
  - `{String} account_name` account_name
  - `{String} dapp` dapp
  - `{String} action` action
  - `{String} pos` pos
  - `{String} offset` offset

- **Use**：

  list actions




### /v1/history/get_key_accounts

- **Params**：
  - `{String} public_key` publick key

- **Use**：

  list accounts


