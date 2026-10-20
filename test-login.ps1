# Test login flow
$headers = @{
    "Content-Type" = "application/json"
}

# First, try login with non-existent account to create one via register
Write-Host "Testing login API..."

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" `
        -Method POST `
        -Headers $headers `
        -Body '{"email":"testcustomer@example.com","password":"TestPassword123"}' `
        -SkipHttpErrorCheck
    
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
    Write-Host "Cookies: $($response.Headers['Set-Cookie'])"
} catch {
    Write-Host "Error: $_"
}
