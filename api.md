# Nova Wallet Portfolio API Documentation

## Base URL

```
https://nova-wallet-portfolio-33f8aa732760.herokuapp.com
```

## Authentication

All endpoints require a license key in the request header:

```
licenseKey: NOVA-TS6JKE6-FVNJ52-GVBHGT6
```

## Endpoints

### 1. Token Wallets

Get token wallet data for a specific timeframe.

```
GET /api-v1/nova-wallet/token-wallets (done)
```

**Query Parameters:**

- `wallet` (required): Wallet address
- `timeframe` (required): One of ["1d", "1w", "30d", "1y"]

**Response:**

```json
{
  'data': {
    'networkId': 1399811149,
    'results': [
      {
        'amountBoughtUsd1d': '0',
        'amountBoughtUsd1w': '0',
        'amountBoughtUsd1y': '9034974.82',
        'amountBoughtUsd30d': '5607929.62',
        'amountSoldUsd1d': '0',
        'amountSoldUsd1w': '6628440.79',
        'amountSoldUsd1y': '8624810.15',
        'amountSoldUsd30d': '6628440.79',
        'amountSoldUsdAll1d': '0',
        'amountSoldUsdAll1w': '6628440.79',
        'amountSoldUsdAll1y': '8624810.15',
        'amountSoldUsdAll30d': '6628440.79',
        'buys1d': 0,
        'buys1w': 0,
        'buys1y': 34,
        'buys30d': 14,
        'firstTransactionAt': 1737476850,
        'lastTransactionAt': 1747589541,
        'purchasedTokenBalance': '2569.093329021',
        'realizedProfitPercentage1d': 0,
        'realizedProfitPercentage1w': 16.66552770315129,
        'realizedProfitPercentage1y': 0.6221982747326299,
        'realizedProfitPercentage30d': 16.66552770315129,
        'realizedProfitUsd1d': '0',
        'realizedProfitUsd1w': '946864.65',
        'realizedProfitUsd1y': '53331.59',
        'realizedProfitUsd30d': '946864.65',
        'sells1d': 0,
        'sells1w': 3,
        'sells1y': 7,
        'sells30d': 3,
        'sellsAll1d': 0,
        'sellsAll1w': 3,
        'sellsAll1y': 7,
        'sellsAll30d': 3,
        'tokenAcquisitionCostUsd': '463496.27',
        'tokenAmountBought1d': '0',
        'tokenAmountBought1w': '0',
        'tokenAmountBought1y': '46351.543720939',
        'tokenAmountBought30d': '31295.143544422',
        'tokenAmountSold1d': '0',
        'tokenAmountSold1w': '31492.161705499',
        'tokenAmountSold1y': '43782.450391918',
        'tokenAmountSold30d': '31492.161705499',
        'tokenAmountSoldAll1d': '0',
        'tokenAmountSoldAll1w': '31492.161705499',
        'tokenAmountSoldAll1y': '43782.450391918',
        'tokenAmountSoldAll30d': '31492.161705499',
        'tokenBalance': '0',
        'token_data': {
          'address': 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn',
          'circulatingSupply': '14934297.02587949',
          'decimals': 9,
          'description': '',
          'id': 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn:1399811149',
          'imageLargeUrl': 'https://token-media.defined.fi/1399811149_J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn_large_3101dd6f-65f7-4f2b-8a8b-968986acd422.png',
          'isScam': None,
          'name': 'Jito Staked SOL',
          'symbol': 'JitoSOL',
          'totalSupply': '15134976.53463252'
        }
      },
      {
        'amountBoughtUsd1d': '0',
        'amountBoughtUsd1w': '6858402.24',
        'amountBoughtUsd1y': '10937653.06',
        'amountBoughtUsd30d': '6858402.24',
        'amountSoldUsd1d': '0',
        'amountSoldUsd1w': '1551564.11',
        'amountSoldUsd1y': '5686873.64',
        'amountSoldUsd30d': '2680415.74',
        'amountSoldUsdAll1d': '0',
        'amountSoldUsdAll1w': '1551564.11',
        'amountSoldUsdAll1y': '11826256.58',
        'amountSoldUsdAll30d': '7167153.39',
        'buys1d': 0,
        'buys1w': 5,
        'buys1y': 64,
        'buys30d': 5,
        'firstTransactionAt': None,
        'lastTransactionAt': 1747677421,
        'purchasedTokenBalance': '30186.066545118',
        'realizedProfitPercentage1d': 0,
        'realizedProfitPercentage1w': -2.5776807252554716,
        'realizedProfitPercentage1y': 0.2645712509002754,
        'realizedProfitPercentage30d': 3.2907520274978954,
        'realizedProfitUsd1d': '0',
        'realizedProfitUsd1w': '-41052.57335076',
        'realizedProfitUsd1y': '15006.13',
        'realizedProfitUsd30d': '85395.68',
        'sells1d': 0,
        'sells1w': 2,
        'sells1y': 72,
        'sells30d': 4,
        'sellsAll1d': 0,
        'sellsAll1w': 2,
        'sellsAll1y': 121,
        'sellsAll30d': 18,
        'tokenAcquisitionCostUsd': '5265785.56',
        'tokenAmountBought1d': '0',
        'tokenAmountBought1w': '39300.418718355',
        'tokenAmountBought1y': '62585.553538862',
        'tokenAmountBought30d': '39300.418718355',
        'tokenAmountSold1d': '0',
        'tokenAmountSold1w': '9114.352173237',
        'tokenAmountSold1y': '32399.486993744',
        'tokenAmountSold30d': '16682.250932287',
        'tokenAmountSoldAll1d': '0',
        'tokenAmountSoldAll1w': '9114.352173237',
        'tokenAmountSoldAll1y': '69506.927173237',
        'tokenAmountSoldAll30d': '46616.052173237',
        'tokenBalance': '0',
        'token_data': {
          'address': 'So11111111111111111111111111111111111111112',
          'circulatingSupply': '0',
          'decimals': 9,
          'description': 'Solana is a highly functional open source project that banks on blockchain technology’s permissionless nature to provide decentralized finance (DeFi) solutions. While the idea and initial work on the project began in 2017, Solana was officially launched in March 2020 by the Solana Foundation with headquarters in Geneva, Switzerland. The Solana protocol is designed to facilitate decentralized app (DApp) creation. It aims to improve scalability by introducing a proof-of-history (PoH) consensus combined with the underlying proof-of-stake (PoS) consensus of the blockchain. Because of the innovative hybrid consensus model, Solana enjoys interest from small-time traders and institutional traders alike. A significant focus for the Solana Foundation is to make decentralized finance accessible on a larger scale.',
          'id': 'So11111111111111111111111111111111111111112:1399811149',
          'imageLargeUrl': 'https://token-media.defined.fi/1399811149_So11111111111111111111111111111111111111112_large_4c51dc5c-cf3a-4cbb-96d6-a5de7c04069e.png',
          'isScam': None,
          'name': 'Wrapped SOL',
          'symbol': 'SOL',
          'totalSupply': '0'
        }
      },
      {
        'amountBoughtUsd1d': '0',
        'amountBoughtUsd1w': '0',
        'amountBoughtUsd1y': '7659.66',
        'amountBoughtUsd30d': '7659.66',
        'amountSoldUsd1d': '0',
        'amountSoldUsd1w': '0',
        'amountSoldUsd1y': '0',
        'amountSoldUsd30d': '0',
        'amountSoldUsdAll1d': '0',
        'amountSoldUsdAll1w': '0',
        'amountSoldUsdAll1y': '0',
        'amountSoldUsdAll30d': '0',
        'buys1d': 0,
        'buys1w': 0,
        'buys1y': 2,
        'buys30d': 2,
        'firstTransactionAt': 1746112737,
        'lastTransactionAt': 1746112737,
        'purchasedTokenBalance': '1717472.837666902',
        'realizedProfitPercentage1d': 0,
        'realizedProfitPercentage1w': 0,
        'realizedProfitPercentage1y': 0,
        'realizedProfitPercentage30d': 0,
        'realizedProfitUsd1d': '0',
        'realizedProfitUsd1w': '0',
        'realizedProfitUsd1y': '0',
        'realizedProfitUsd30d': '0',
        'sells1d': 0,
        'sells1w': 0,
        'sells1y': 0,
        'sells30d': 0,
        'sellsAll1d': 0,
        'sellsAll1w': 0,
        'sellsAll1y': 0,
        'sellsAll30d': 0,
        'tokenAcquisitionCostUsd': '7659.66',
        'tokenAmountBought1d': '0',
        'tokenAmountBought1w': '0',
        'tokenAmountBought1y': '1717472.837666902',
        'tokenAmountBought30d': '1717472.837666902',
        'tokenAmountSold1d': '0',
        'tokenAmountSold1w': '0',
        'tokenAmountSold1y': '0',
        'tokenAmountSold30d': '0',
        'tokenAmountSoldAll1d': '0',
        'tokenAmountSoldAll1w': '0',
        'tokenAmountSoldAll1y': '0',
        'tokenAmountSoldAll30d': '0',
        'tokenBalance': '0',
        'token_data': {
          'address': '6N7CrWe6qNt27G4sHXcjQMMy6btKRb7i9n4RYkKboop',
          'circulatingSupply': '999909194.55699327',
          'decimals': 9,
          'description': 'The first token deployed on Boop. Join Betty as she ventures into the vast unknown lands of Boop and make new friends along the way!\n\nCA: 6N7CrWe6qNt27G4sHXcjQMMy6btKRb7i9n4RYkKboop',
          'id': '6N7CrWe6qNt27G4sHXcjQMMy6btKRb7i9n4RYkKboop:1399811149',
          'imageLargeUrl': 'https://token-media.defined.fi/1399811149_6N7CrWe6qNt27G4sHXcjQMMy6btKRb7i9n4RYkKboop_1746231939_large.png',
          'isScam': None,
          'name': 'BETTY ON BOOP',
          'symbol': 'BETTY',
          'totalSupply': '999909194.55699327'
        }
      },
      {
        'amountBoughtUsd1d': '0',
        'amountBoughtUsd1w': '1551564.11',
        'amountBoughtUsd1y': '2650296.99',
        'amountBoughtUsd30d': '2472114.91',
        'amountSoldUsd1d': '0',
        'amountSoldUsd1w': '229961.46',
        'amountSoldUsd1y': '408153.26',
        'amountSoldUsd30d': '229961.46',
        'amountSoldUsdAll1d': '0',
        'amountSoldUsdAll1w': '229961.46',
        'amountSoldUsdAll1y': '1615281.02',
        'amountSoldUsdAll30d': '229961.46',
        'buys1d': 0,
        'buys1w': 2,
        'buys1y': 10,
        'buys30d': 4,
        'firstTransactionAt': 1733238255,
        'lastTransactionAt': 1747677421,
        'purchasedTokenBalance': '2242412.14111',
        'realizedProfitPercentage1d': 0,
        'realizedProfitPercentage1w': -0.004885454178250444,
        'realizedProfitPercentage1y': -0.000369535643936484,
        'realizedProfitPercentage30d': -0.004885454178250444,
        'realizedProfitUsd1d': '0',
        'realizedProfitUsd1w': '-11.23521047',
        'realizedProfitUsd1y': '-1.50827736',
        'realizedProfitUsd30d': '-11.23521047',
        'sells1d': 0,
        'sells1w': 2,
        'sells1y': 7,
        'sells30d': 2,
        'sellsAll1d': 0,
        'sellsAll1w': 2,
        'sellsAll1y': 16,
        'sellsAll30d': 2,
        'tokenAcquisitionCostUsd': '2242142.22',
        'tokenAmountBought1d': '0',
        'tokenAmountBought1w': '1551797.654686',
        'tokenAmountBought1y': '2650589.352785',
        'tokenAmountBought30d': '2472412.14111',
        'tokenAmountSold1d': '0',
        'tokenAmountSold1w': '230000',
        'tokenAmountSold1y': '408177.211675',
        'tokenAmountSold30d': '230000',
        'tokenAmountSoldAll1d': '0',
        'tokenAmountSoldAll1w': '230000',
        'tokenAmountSoldAll1y': '1615090.517021',
        'tokenAmountSoldAll30d': '230000',
        'tokenBalance': '12970922.53265',
        'token_data': {
          'address': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          'circulatingSupply': '8734900002.701792',
          'decimals': 6,
          'description': '',
          'id': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v:1399811149',
          'imageLargeUrl': 'https://token-media.defined.fi/1399811149_EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v_large_c8d2766f-09f9-48b6-ae77-54a3191a8eaf.png',
          'isScam': None,
          'name': 'USD Coin',
          'symbol': 'USDC',
          'totalSupply': '8734900002.701792'
        }
      }
    ],
    'walletAddress': 'GiwAGiwBiWZvi8Lrd7HmsfjYA6YgjJgXWR26z6ffTykJ'
  }
}
```

### 2. Wallet PnL Chart

Get profit and loss chart data.

```
GET /api-v1/nova-wallet/wallet-pnl-chart (done)
```

**Query Parameters:**

- `wallet` (required): Wallet address
- `timeframe` (required): One of ["1d", "1w", "30d", "1y"]

**Response:**

```json
{
  "data": {
    "walletAddress": "string",
    "resolution": "string",
    "range": {
      "start": "timestamp",
      "end": "timestamp"
    },
    "networkId": "number",
    "data": [
      {
        "realizedProfitUsd": "number",
        "resolution": "string",
        "swaps": "number",
        "timestamp": "timestamp",
        "volumeUsd": "number",
        "volumeUsdAll": "number"
      }
    ]
  }
}
```

### 3. Wallet Stats

Get detailed wallet statistics.

```
GET /api-v1/nova-wallet/wallet-stats (done)
```

**Query Parameters:**

- `wallet` (required): Wallet address

**Response:**

```json
{
  "data": {
    "lastTransactionAt": 1747677421,
    "scammerScore": 0,
    "statsDay1": {
      "day1Stats": {
        "losses": 0,
        "swaps": 0,
        "uniqueTokens": 0,
        "wins": 0
      },
      "end": 1748089199,
      "lastTransactionAt": 0,
      "networkId": 1399811149,
      "start": 1748002799,
      "statsUsd": {
        "averageProfitUsdPerTrade": "0",
        "averageSwapAmountUsd": "0",
        "heldTokenAcquisitionCostUsd": "0",
        "realizedProfitPercentage": 0,
        "realizedProfitUsd": "0",
        "soldTokenAcquisitionCostUsd": "0",
        "volumeUsd": "0",
        "volumeUsdAll": "0"
      },
      "walletAddress": "GiwAGiwBiWZvi8Lrd7HmsfjYA6YgjJgXWR26z6ffTykJ"
    },
    "statsDay30": {
      "day30Stats": {
        "losses": 4,
        "swaps": 17,
        "uniqueTokens": 4,
        "wins": 3
      },
      "end": 1748089199,
      "lastTransactionAt": 1747677421,
      "networkId": 1399811149,
      "start": 1745497199,
      "statsUsd": {
        "averageProfitUsdPerTrade": "53282.4021892941176470588235294117647058823529",
        "averageSwapAmountUsd": "494703.9033064705882352941176470588235294117647",
        "heldTokenAcquisitionCostUsd": "8481798.687533",
        "realizedProfitPercentage": 12.070640431981216,
        "realizedProfitUsd": "905800.837218",
        "soldTokenAcquisitionCostUsd": "7504165.51899",
        "volumeUsd": "8409966.35621",
        "volumeUsdAll": "10961387.62021063"
      },
      "walletAddress": "GiwAGiwBiWZvi8Lrd7HmsfjYA6YgjJgXWR26z6ffTykJ"
    },
    "statsWeek1": {
      "end": 1748089199,
      "lastTransactionAt": 1747677421,
      "networkId": 1399811149,
      "start": 1747484399,
      "statsUsd": {
        "averageProfitUsdPerTrade": "129400.1196025142857142857142857142857142857143",
        "averageSwapAmountUsd": "1201423.7651722857142857142857142857142857142857",
        "heldTokenAcquisitionCostUsd": "8481798.687573",
        "realizedProfitPercentage": 12.070640431974278,
        "realizedProfitUsd": "905800.8372176",
        "soldTokenAcquisitionCostUsd": "7504165.518991",
        "volumeUsd": "8409966.356206",
        "volumeUsdAll": "8409966.356206"
      },
      "walletAddress": "GiwAGiwBiWZvi8Lrd7HmsfjYA6YgjJgXWR26z6ffTykJ",
      "week1Stats": {
        "losses": 4,
        "swaps": 7,
        "uniqueTokens": 3,
        "wins": 3
      }
    },
    "statsYear1": {
      "end": 1748089199,
      "lastTransactionAt": 1747677421,
      "networkId": 1399811149,
      "start": 1716553199,
      "statsUsd": {
        "averageProfitUsdPerTrade": "767.1516680661599329896907216494845360824742",
        "averageSwapAmountUsd": "80142.6051924426329896907216494845360824742268",
        "heldTokenAcquisitionCostUsd": "8481798.687533",
        "realizedProfitPercentage": 0.9664847682800469,
        "realizedProfitUsd": "148827.423604835027",
        "soldTokenAcquisitionCostUsd": "15398837.9837260976",
        "volumeUsd": "15547665.4073338708",
        "volumeUsdAll": "23880636.6713058216"
      },
      "walletAddress": "GiwAGiwBiWZvi8Lrd7HmsfjYA6YgjJgXWR26z6ffTykJ",
      "year1Stats": {
        "losses": 63,
        "swaps": 194,
        "uniqueTokens": 29,
        "wins": 63
      }
    },
    "walletAddress": "GiwAGiwBiWZvi8Lrd7HmsfjYA6YgjJgXWR26z6ffTykJ"
  }
}
```

## Rate Limits

- All endpoints are limited to 60 requests per minute
- Rate limit exceeded will return 429 status code

## Error Responses

```json
{
  "error": "Error message"
}
```

### 4. Holdings

```
GET `/api-v1/nova-wallet/wallet-holdings`
```

**Query Parameters:**

- `wallet` (required): Wallet address

**Response:**

```json
{
  "data": [
    {
      "amount": 5970922.776723,
      "change24": "-0.00008001360231239311",
      "image": "https://crypto-token-logos-production.s3.us-west-2.amazonaws.com/1399811149_EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v_small_c8d2766f-09f9-48b6-ae77-54a3191a8eaf.png",
      "liquidity": "22521021",
      "marketCap": "8952172076",
      "name": "USD Coin",
      "price": 0.99975,
      "symbol": "USDC",
      "value": 5969430.04602882
    },
    {
      "amount": 32.0,
      "change24": "0",
      "image": null,
      "liquidity": "0",
      "marketCap": "30241300673",
      "name": "OFFICIAL TRUMP",
      "price": 30.2413275683,
      "symbol": "TRUMP",
      "value": 967.7224821856
    },
    {
      "amount": 888.0,
      "change24": "0",
      "image": null,
      "liquidity": "0",
      "marketCap": "296695493",
      "name": "Vine Coin",
      "price": 0.296822994711,
      "symbol": "VINE",
      "value": 263.578819303368
    },
    {
      "amount": 5099.0,
      "change24": "0",
      "image": null,
      "liquidity": "0",
      "marketCap": "14381228",
      "name": "Official Cuba Coin",
      "price": 0.0143881255738,
      "symbol": "CUBA",
      "value": 73.3650523008062
    },
    {
      "amount": 5000000.0,
      "change24": "0",
      "image": null,
      "liquidity": "0",
      "marketCap": "6894384",
      "name": "Rizzmas",
      "price": 1.38793831071e-05,
      "symbol": "Rizzmas",
      "value": 69.3969155355
    },
    {
      "amount": 1088.0,
      "change24": "0",
      "image": null,
      "liquidity": "2",
      "marketCap": "58894812",
      "name": "Vine Coin",
      "price": 0.0589551581297,
      "symbol": "VINE",
      "value": 64.1432120451136
    },
    {
      "amount": 99.0,
      "change24": "0",
      "image": null,
      "liquidity": "2",
      "marketCap": "199947079",
      "name": "Vine Coin",
      "price": 0.199955676392,
      "symbol": "VINE",
      "value": 19.795611962808
    },
    {
      "amount": 155.0,
      "change24": "0",
      "image": null,
      "liquidity": "137",
      "marketCap": "59585410",
      "name": "Urolithin A",
      "price": 0.0596151710426,
      "symbol": "URO",
      "value": 9.240351511603
    },
    {
      "amount": 106.0,
      "change24": "0",
      "image": null,
      "liquidity": "21",
      "marketCap": "123548440",
      "name": "Rifampicin",
      "price": 0.0617964502946,
      "symbol": "RIF",
      "value": 6.5504237312276
    },
    {
      "amount": 1000.0,
      "change24": "0.03676175606573127",
      "image": "https://crypto-token-logos-production.s3.us-west-2.amazonaws.com/1399811149_Goatm5cqggssKRUwbMnPhHXKtN5SDGEP57qjwTSHD1Xf_1739245378_small.png",
      "liquidity": "53790",
      "marketCap": "743484",
      "name": "GoatIndex.ai",
      "price": 0.000743526690718,
      "symbol": "AIAI",
      "value": 0.743526690718
    },
    {
      "amount": 200.0,
      "change24": "0",
      "image": "https://crypto-token-logos-production.s3.us-west-2.amazonaws.com/1399811149_7udU2DKfgAisAitfG2AgzHvZNoK6Aihc8UsMk89pwNwk_1738340101_small.png",
      "liquidity": "4",
      "marketCap": "1534",
      "name": "DigiHealth (Wormhole)",
      "price": 0.000144014934251,
      "symbol": "DGH",
      "value": 0.0288029868502
    },
    {
      "amount": 5.0,
      "change24": "-0.1513803930237412",
      "image": "https://crypto-token-logos-production.s3.us-west-2.amazonaws.com/1399811149_5pPkhLEJDMFDHUuE1wW5os5YJeyNUDVmih1DKgMFpB38_1746308625_small.png",
      "liquidity": "330067",
      "marketCap": "81540309",
      "name": "Oracler",
      "price": 0.000815403389094,
      "symbol": "Oracler",
      "value": 0.00407701694547
    },
    {
      "amount": 1.9e-05,
      "change24": "-0.000049367426879120204",
      "image": null,
      "liquidity": "10",
      "marketCap": "1452882218",
      "name": "Jitο Staked SΟL",
      "price": 177.335083904,
      "symbol": "JitοSΟL",
      "value": 0.003369366594176
    }
  ]
}
```

### 5. Deployed Tokens

```
GET /api-v1/nova-wallet/deployed-tokens
```

**Query Parameters:**

- `wallet` (required): Wallet address

**Response:**

```json
{
  "data": {
    "count": 0,
    "page": 0,
    "results": [],
    "walletAddress": "GiwAGiwBiWZvi8Lrd7HmsfjYA6YgjJgXWR26z6ffTykJ"
  }
}
```

**Response with a token**

```json
 {
  "data": {
    "count": 1,
    "page": 0,
    "results": [
      {
        "address": "5qjPkmd21eLxpWkTeyhV3naP5uGsfCchdiNrV4ucpump",
        "createdAt": 1748262129,
        "decimals": 6,
        "image": "https://crypto-token-logos-production.s3.us-west-2.amazonaws.com/1399811149_5qjPkmd21eLxpWkTeyhV3naP5uGsfCchdiNrV4ucpump_1748262272_small.png",
        "liquidity": "11067",
        "name": "Dark SOL",
        "networkId": 1399811149,
        "priceUSD": "0.0000366617490221",
        "symbol": "DarkSOL"
      }
    ],
    "walletAddress": "BUReFtZHcTmB9xoiqyqetkPXj2ShJi1KNwjVvaXzJTq"
  }
}
```


Common status codes:

- 200: Success
- 400: Bad Request (missing parameters)
- 401: Unauthorized (invalid license key)
- 429: Too Many Requests
- 500: Internal Server Error

