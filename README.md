# Sandkasten
Backend to easyly setup multiple erdblock instances and manage them via web gui.

## Install
````shell
# clone repo
git clone git@github.com:erdblock/sandkasten.git

cd sandkasten

# install dependencies
npm install

# edit config (database, etc.)
nano config.js

# create database tables
node install/install.js

# start sandkasten
node index.js
````


## UI Layout
- Header
	- Sandkasten
	- Account
		- About Me
		- Security
		- Delete account
	- Plugins
		- Plugins
		- New Plugin
	- Publishers
		- Publishers
		- new Publisher
	- Logout

- Section (left)
	- H2 Title
	- ul

- Section (right)
	- H1 Main Title
	- Content


## Database

### `user`
Save user information

| Name | Type |
| --- | --- | --- |
| id | int | primary key |
| username | string |
| mail | string |
| password | string (sha512) |
| title | string |
| subtitle | string |




### `plugins`
NPM-Name to ID relation.

| Name | Type |
| --- | --- | --- |
| id | int | primary key |
| npmName | text |

### `pluginInstances`
Instances of plugins.

| Name | Type |
| --- | --- | --- |
| id | int | primary key |
| pluginId | int |
| userId | int |

### `pluginConfig`
Key - Value Storage for plugin settings.

| Name | Type |
| - | - | - |
| userID | int | primary key |
| instanceId | int | primary key |
| key | text | primary key |
| value | text |




### `publishers`
NPM-Name to ID relation.

| Name | Type |
| --- | --- | --- |
| id | int | primary key |
| npmName | text |


### `publisherInstances`
Instances of publishers.

| Name | Type |
| --- | --- | --- |
| id | int | primary key |
| publisherId | int |
| userId | int |

### `publisherConfig`
Key - Value Storage for publisher settings.

| Name | Type |
| --- | --- | --- |
| userID | int | primary key |
| publisherInstanceId | int | primary key |
| key | text | primary key |
| value | text |
