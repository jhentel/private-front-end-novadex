API Docs
1. Setup 2FA
Endpoint: POST /api-v1/2fa/setup

Body:
json{
  "code": "123456",     // 6-digit 2FA code chosen by the user
  "email": "user@example.com"
}

Response:
json{
  "success": true,
  "message": "Verification email sent. Please check your inbox."
}

Errors:
400: Invalid request parameters or 2FA already enabled
401: Invalid session token
500: Failed to send verification email

2. Verify 2FA Setup
Endpoint: GET /api-v1/2fa/verify

Query Parameters:
token: The verification token from the email link

Response:
json{
  "success": true,
  "message": "2FA has been successfully set up."
}

Errors:
400: Invalid or expired token
404: User not found
500: Failed to update user

3. Get 2FA Status
Endpoint: GET /api-v1/2fa/status

Response:
json{
  "enabled": true,
  "email": "user@example.com"
}

Errors:
401: Invalid session token

4. Authentication
Endpoint: POST /api-v1/authenticate

Body:
json{
  "signature": "0x...",
  "nonce": "random_string",
  "signer": "0x...",
  "code": "access_code",
  "two_factor_code": "123456" // Optional, required if 2FA is enabled
}

Response (when 2FA is not enabled or already verified):
json{
  "success": true,
  "message": "Successfully authenticated",
  "token": "jwt-token-here",
  "isNew": false,
  "isTelegramConnected": true,
  "requires2FA": false
}

Response (when 2FA is required but no code provided):
json{
  "success": true,
  "message": "Wallet authentication successful. Please provide 2FA code.",
  "token": "", // No token provided yet
  "isNew": false,
  "isTelegramConnected": true,
  "requires2FA": true
}