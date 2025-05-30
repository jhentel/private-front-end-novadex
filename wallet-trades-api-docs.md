# API Endpoint Documentation - Wallet Feature

This documentation details the API endpoints required to implement the features shown in the Wallet UI design, including summary data, historical P&L, trade/holding/deployed token lists, and wallet-specific details/actions.

**Base URL:** `[API_BASE_URL]` (Needs to be determined based on environment or configuration)

---

## 1. Wallet Details & Metadata

Fetches specific details for a given wallet address, including its user-defined name and favorite status.

- **Method:** `GET`
- **Path:** `/wallets/{walletAddress}/details`
- **Path Parameters:**
  - `walletAddress` (string, required): The wallet address.
- **Query Parameters:**
  - (None specified, but could include user context if needed)
- **Success Response (Example):**
  ```json
  {
    "walletAddress": "DUm...vcJ",
    "name": "My Wallet",
    "isFavorite": true
    // ... other potential metadata
  }
  ```
- **Description:** Retrieves user-specific metadata associated with a particular wallet address, such as its custom name and whether it's marked as a favorite.

---

## 2. Update Wallet Details

Updates the user-defined name for a specific wallet.

- **Method:** `PUT` or `PATCH`
- **Path:** `/wallets/{walletAddress}`
- **Path Parameters:**
  - `walletAddress` (string, required): The wallet address to update.
- **Request Body (Example):**
  ```json
  {
    "name": "My Primary Wallet"
  }
  ```
- **Success Response (Example):**
  ```json
  {
    "success": true,
    "message": "Wallet name updated successfully.",
    "wallet": {
      "walletAddress": "DUm...vcJ",
      "name": "My Primary Wallet",
      "isFavorite": true
    }
  }
  ```
- **Description:** Allows the user to change the custom name assigned to their wallet.

---

## 3. Toggle Wallet Favorite Status

Marks or unmarks a wallet as a favorite for the user.

- **Method:** `POST` (or `PUT`/`PATCH`)
- **Path:** `/wallets/{walletAddress}/favorite`
- **Path Parameters:**
  - `walletAddress` (string, required): The wallet address.
- **Request Body (Optional Example for PUT/PATCH):**
  ```json
  {
    "isFavorite": true // or false
  }
  ```
- **Success Response (Example):**
  ```json
  {
    "success": true,
    "message": "Wallet marked as favorite.", // or "Wallet removed from favorites."
    "isFavorite": true // The new status
  }
  ```
- **Description:** Toggles the favorite status of the specified wallet. If using POST, the endpoint might simply toggle the status. If using PUT/PATCH, the desired state might be sent in the body.

---

## 4. Wallet Summary (Header)

Fetches the financial summary data for the user's wallet.

- **Method:** `GET`
- **Path:** `/wallet/summary`
- **Query Parameters:**
  - `walletAddress` (string, required): The user's wallet address.
- **Success Response (Example):**
  ```json
  {
    "totalSpent": 147.72359, // In SOL or USD?
    "totalHolding": 147.72359, // In SOL or USD?
    "totalPnl": 13.98, // In USD?
    "pnlPercentage": 0.2
  }
  ```
- **Description:** Returns the total value spent, current total holding value, and total P&L (Profit and Loss) along with its percentage for the given wallet. _Note: Could potentially be combined with the `/wallets/{walletAddress}/details` endpoint if desired by the backend._

---

## 5. P&L History (Chart)

Fetches historical P&L data to be displayed in the chart.

- **Method:** `GET`
- **Path:** `/wallet/pnl-history`
- **Query Parameters:**
  - `walletAddress` (string, required): The user's wallet address.
  - `range` (string, required): The time range for the historical data. Possible values: `1h`, `6h`, `12h`, `24h`, `7d`, `all`.
- **Success Response (Example):**
  ```json
  {
    "data": [
      { "time": 1678886400, "value": 1000 },
      { "time": 1678887000, "value": 1500 },
      { "time": 1678887600, "value": 1200 }
      // ... other data points
    ]
  }
  ```
- **Description:** Returns a series of data points (timestamp and P&L value) for the selected time range, used to render the P&L history chart.

---

## 6. Trade History (Table - Trade History Tab)

Fetches the list of trades (buy/sell) executed by the wallet.

- **Method:** `GET`
- **Path:** `/wallet/trades`
- **Query Parameters:**
  - `walletAddress` (string, required): The user's wallet address.
  - `page` (integer, optional, default: 1): Page number for pagination.
  - `limit` (integer, optional, default: 20): Number of items per page.
  - `sortBy` (string, optional, default: 'age'): Column to sort by (e.g., `age`, `value`, `pnl`).
  - `order` (string, optional, default: 'desc'): Sort direction (`asc` or `desc`).
- **Success Response (Example):**
  ```json
  {
    "trades": [
      {
        "id": "tx1",
        "age": "2m",
        "type": "S",
        "tokenIconUrl": "...",
        "tokenName": "CelestialChip",
        "tokenSymbol": "cchip",
        "tokenAddress": "0x739...dd12",
        "value": 860000, // USD?
        "amountOfTokens": 2100,
        "totalSol": 0.0409,
        "pnl": 50.5 // Example P&L for a Sell trade
      }
      // ... other trades
    ],
    "totalItems": 150,
    "currentPage": 1,
    "totalPages": 8
  }
  ```
- **Description:** Returns a paginated and sorted list of trades based on the provided parameters.

---

## 7. Most Profitable Trades (Table - Most Profitable Tab)

Fetches the list of trades sorted by the highest profitability. This likely uses the same endpoint as Trade History but with the `sortBy=pnl`.

- **Method:** `GET`
- **Path:** `/wallet/trades`
- **Query Parameters:**
  - `walletAddress` (string, required): The user's wallet address.
  - `page` (integer, optional, default: 1): Page number for pagination.
  - `limit` (integer, optional, default: 20): Number of items per page.
  - `sortBy` (string, required): **Must be set to `pnl`** or another relevant profitability field.
  - `order` (string, optional, default: 'desc'): Sort direction (usually `desc` for most profitable).
- **Success Response:** Same structure as the `/wallet/trades` endpoint.
- **Description:** Returns a paginated list of trades, sorted by the highest P&L.

---

## 8. Holding (Table - Holding Tab)

Fetches the list of tokens currently held by the wallet.

- **Method:** `GET`
- **Path:** `/wallet/holdings`
- **Query Parameters:**
  - `walletAddress` (string, required): The user's wallet address.
  - `page` (integer, optional, default: 1): Page number for pagination.
  - `limit` (integer, optional, default: 20): Number of items per page.
  - `sortBy` (string, optional): Column to sort by (e.g., `currentValue`, `pnl`).
  - `order` (string, optional, default: 'desc'): Sort direction (`asc` or `desc`).
- **Success Response (Example):**
  ```json
  {
    "holdings": [
      {
        "id": "holding1",
        "tokenIconUrl": "...",
        "tokenName": "InfinityMint",
        "tokenSymbol": "imint",
        "tokenAddress": "0x739...dd12",
        "currentValue": 860000, // USD?
        "amountOfTokens": 2100,
        "totalSolInvested": 1.2434,
        "pnl": 120.75 // Current P&L
      }
      // ... other holdings
    ],
    "totalItems": 25,
    "currentPage": 1,
    "totalPages": 2
  }
  ```
- **Description:** Returns a list of tokens currently held by the wallet, along with their current value, token amount, and associated P&L.

---

## 9. Deployed Tokens (Table - Deployed Tokens Tab)

Fetches the list of tokens created/deployed by the user's wallet.

- **Method:** `GET`
- **Path:** `/wallet/tokens/deployed`
- **Query Parameters:**
  - `walletAddress` (string, required): The user's wallet address (deployer address).
  - `page` (integer, optional, default: 1): Page number for pagination.
  - `limit` (integer, optional, default: 20): Number of items per page.
  - `sortBy` (string, optional): Column to sort by (e.g., `deploymentTime`, `marketCap`).
  - `order` (string, optional, default: 'desc'): Sort direction (`asc` or `desc`).
- **Success Response (Example):**
  ```json
  {
    "tokens": [
      {
        "id": "deployed1",
        "deploymentTime": "2024-01-10T10:00:00Z", // Or age: "6h"
        "tokenIconUrl": "...",
        "tokenName": "HyperHash",
        "tokenSymbol": "hhash",
        "tokenAddress": "0xabc...def",
        "currentMarketCap": 1500000, // USD?
        "liquidity": 50000 // USD?
        // ... other relevant data
      }
      // ... other tokens
    ],
    "totalItems": 5,
    "currentPage": 1,
    "totalPages": 1
  }
  ```
- **Description:** Returns a list of tokens deployed by the specified wallet, along with relevant information like deployment time, market cap, etc.

---

**Important Notes:**

- Endpoint paths (`/wallets/...`, `/wallet/summary`, etc.) and query/path parameters are **assumptions** based on common practices and visible functionality. Actual names and parameters must be confirmed with the backend team.
- The data structures in the responses are **examples**. The exact data structure should match what the backend API delivers.
- Pay attention to data types and units (e.g., whether values are in SOL or USD).
- Consider potential API consolidation (e.g., merging `/wallet/summary` and `/wallets/{walletAddress}/details`) if feasible and desired.
- Ensure robust error handling on the frontend to manage API request failures.
- Authentication/Authorization headers will likely be required for most of these endpoints, especially those involving user-specific data or actions.
