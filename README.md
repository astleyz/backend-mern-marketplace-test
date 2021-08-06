## Usage

Rename env-example to .env :

```javascript
mv env-example .env;
```

Replace the database reference inside .env file

```javascript
DATABASE_URL=mongodb://login:password@localhost:27017/db
// =>  DATABASE_URL=`your database link`
```

Start

```javascript
  yarn install
  yarn dev
```

## Running inside docker

```javascript
docker-compose up -d
```
