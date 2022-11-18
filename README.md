<img src="https://companieslogo.com/img/orig/MDB_BIG-ad812c6c.png?t=1648915248" width="50%" title="Github_Logo"/> <br>

# Queryable Encryption Sample

## TOC

- Reference source: [MongoDB Quick Start](https://www.mongodb.com/docs/manual/core/queryable-encryption/quick-start/)
  - [Zoom-out](https://www.mongodb.com/blog/post/mongodb-releases-queryable-encryption-preview)
  - [Client vs CMK/KMS vs DEKs/KeyVault](https://www.mongodb.com/docs/manual/core/queryable-encryption/fundamentals/kms-providers/#local-key-provider)
  - [Required S/W stack](https://www.mongodb.com/docs/manual/core/queryable-encryption/install/): all preloaded inside containers
- [What's the Big Deal?](#whats-the-big-deal)
- [Test Setup](#test-setup)
  - [Local setup](#local-setup)
  - [Atlas setup](#atlas-setup)
  - [Node setup](#node-setup)
- [Run Test](#run-test)
  - [Auto encryption](#auto-encryption)
    - [insertOne](#autoencrypt_insertonejs)
    - [findOne](#autoencrypt_findonejs)
    - [updateOne](#autoencrypt_updateonejs)
  - [Explicit encryption](#explicit-encryption)
    - [insertOne NoEnc](#explicitencrypt_insertone_noencjs)
    - [insertOne](#explicitencrypt_insertonejs)
    - [findOne NoEnc](#explicitencrypt_findone_noencjs)
    - [findOne](#explicitencrypt_findonejs)

## What's the Big Deal?

MongoDB Queryable Encryption(hereinafter QE) is one of application level encryption solutions. However, unlike other PPE solutions based on **deterministic** encryption, MDB QE applies **fully random** encryption to both searchable and non-searchable documents leveraging [STE EMM](https://dl.acm.org/doi/abs/10.1007/978-3-030-77883-5_13).

Without PPE's vulnerabiity like **frequency leak**, MDB QE makes a great fit for **cloud** adoption by taking security a step further, thus best helps customers with digital modernization.

Currently capable of [equality query](https://www.mongodb.com/docs/manual/core/queryable-encryption/fundamentals/encrypt-and-query/#query-types) as a preview as of MDB v6.0.2, QE will soon add more advanced queries that cannot be supported by PPE.

- range
- prefix/suffix
- substring

  > **PPE**: Property Preserving Encryption  
  > **STE**: STructured Encryption  
  > **EMM**: Encrypted Multi-Map

## Test Setup

> **Prep**:  
> copy [env](https://github.com/ghcho20/mongodb-fledemo/blob/main/env) file to .env and set variables

A containerized test environment that supports 2 modes.

- local: runs entirely within local containers
- atlas: requires [Atlas](https://account.mongodb.com/account/login?nds=true) cloud provisioning

, based on local kms provider(client container)

and comprising 3 containers

- client: a **node** project for running codes
- community: runs MongoDB community edition for both **key vault** and **explicit encryption** tests
- enterprise: runs MongoDB enterprise edition for **auto encryption** tests

  > **note**: Community edition does not support auto encryption

### Local setup

> `docker-compose up -d local`

![local setup](/res/local.png)

- community: key vault & explicit encryption
- enterprise: auto encryption

### Atlas setup

> set `USE_ATLAS` and `ATLAS_CONN_URI` in `.env`  
> `docker-compose up -d atlas`

![atlas setup](/res/atlas.png)

- community: key vault & explicit encryption
- [atlas](https://account.mongodb.com/account/login?nds=true): auto encryption

### Node setup

> 1> start the client container  
> `docker exec -itu node client bash`

> 2> install node modules  
> `npm install`

```
node@client:~/demo$ ls -l
total 140
drwxr-xr-x 1 501 dialout    256 Nov 13 05:02 crypt_shared/
drwxr-xr-x 1 501 dialout    288 Nov 14 02:36 demo_fns/
-rw-r--r-- 1 501 dialout 126117 Nov 13 18:51 package-lock.json
-rw-r--r-- 1 501 dialout    356 Nov 12 19:44 package.json
drwxr-xr-x 1 501 dialout    224 Nov 13 04:39 utils/


node@client:~/demo$ npm install

added 133 packages, and audited 134 packages in 6s

10 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

## Run Test

> Move to `demo_fns` inside client container

```
node@client:~/demo$ ls -l
total 144
drwxr-xr-x 1 501 dialout    256 Nov 13 05:02 crypt_shared/
drwxr-xr-x 1 501 dialout    288 Nov 14 02:36 demo_fns/
drwxr-xr-x 1 501 dialout   2176 Nov 14 12:04 node_modules/
-rw-r--r-- 1 501 dialout 126117 Nov 14 12:04 package-lock.json
-rw-r--r-- 1 501 dialout    356 Nov 12 19:44 package.json
drwxr-xr-x 1 501 dialout    224 Nov 13 04:39 utils/
node@client:~/demo$ cd demo_fns/
node@client:~/demo/demo_fns$ ls -l
total 28
-rw-r--r-- 1 501 dialout  849 Nov 14 00:27 autoEncrypt_findOne.js
-rw-r--r-- 1 501 dialout  766 Nov 13 23:31 autoEncrypt_insertOne.js
-rw-r--r-- 1 501 dialout  750 Nov 14 00:49 autoEncrypt_updateOne.js
-rw-r--r-- 1 501 dialout 1092 Nov 14 02:39 explicitEncrypt_findOne.js
-rw-r--r-- 1 501 dialout  854 Nov 14 03:22 explicitEncrypt_findOne_noEnc.js
-rw-r--r-- 1 501 dialout 1400 Nov 14 02:30 explicitEncrypt_insertOne.js
-rw-r--r-- 1 501 dialout  771 Nov 14 03:21 explicitEncrypt_insertOne_noEnc.js
```

> Run each test by  
> `node <test file>.js`

### Auto encryption

Enterprise/Atlas replica set only.

#### `autoEncrypt_insertOne.js`

- runs `insertOne` through a crypto client
- cryptlib encrypts fields specified by encryption spec
- reads the document and confirms the encrypted fields through a non-crypto client

  > Two index collections are generated (`ecoc`, `esc`)

  ```
  Enterprise rsfle [primary] medicalRecords> show collections
  patients
  enxcol_.patients.ecoc
  enxcol_.patients.esc
  ```

#### `autoEncrypt_findOne.js`

- runs `findOne` through a non-crypto client  
  : no document found
- runs `findOne` on a non-index field through a crypto client  
  : an exception thrown
- runs `findOne` on an index field througha crypto client  
  : found successfully

#### `autoEncrypt_updateOne.js`

- finds(`findOne`) and updates(`updateOne`) a document
- a crypt-ignorant client reads and confirms fields are encrypted properly

  > It generates the last, third index collection, `ecc`

  ```
  Enterprise rsfle [primary] medicalRecords> show collections
  patients                   [queryable-encryption]
  enxcol_.patients.ecc
  enxcol_.patients.ecoc
  enxcol_.patients.esc
  ```

### Explicit encryption

Because community edition does not support auto encryption (does support auto decryption though), applications must perform explicit encryption in and of themselves when inserting and querying.

#### `explicitEncrypt_insertOne_noEnc.js`

- runs `insertOne` through an explicit encrypt client
- a crypt-ignorant client reads and confirms that fields are plain data

#### `explicitEncrypt_insertOne.js`

- application explicity encrypts fields using cryptlib and adds(`insertOne`)
- a non-crypto client reads and confirms that fields are properly encrypted

#### `explicitEncrypt_findOne_noEnc.js`

- a non-crypto client tries `findOne`  
  : no document found
- an explicit encrypt client tries `findOne` on non-index field  
  : no document found
  > Unlike auto encrypt client, the cryptlib must bypass query analysis for explicit encryption, thus does not throw an exception
- an explicit encrypt client tries on indexed field  
  : no document found

#### `explicitEncrypt_findOne.js`

- a non-crypto client tries `findOne`  
  : no document found
- an explicit encrypt client tries `findOne` on non-index field  
  : no document found
  > Unlike auto encrypt client, the cryptlib must bypass query analysis for explicit encryption, thus does not throw an exception  
  > Application cannot set queryType for non-index field explicit encryption
- Application explicitly encrypts and tries on indexed field  
  : found successfully
