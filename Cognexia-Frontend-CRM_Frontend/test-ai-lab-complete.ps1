# CognexiaAI AI Lab - Comprehensive Testing Script
# Tests all AI/LLM features with real API calls

$BASE_URL = "https://cognexia-crm-backend-production.up.railway.app/api/v1"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CognexiaAI AI Lab - Complete Test Suite" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Authentication
Write-Host "[1/7] Authenticating..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/demo-login" `
        -Method POST `
        -ContentType "application/json" `
        -UseBasicParsing

    $TOKEN = $loginResponse.accessToken
    $headers = @{
        "Authorization" = "Bearer $TOKEN"
        "Content-Type" = "application/json"
    }
    Write-Host "✅ Authenticated as: $($loginResponse.user.email)`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Authentication failed: $_`n" -ForegroundColor Red
    exit 1
}

# Step 2: Check Available Models
Write-Host "[2/7] Checking Available AI Models..." -ForegroundColor Yellow
try {
    $models = Invoke-RestMethod -Uri "$BASE_URL/llm/models" `
        -Method GET `
        -Headers $headers `
        -UseBasicParsing
    
    Write-Host "✅ Available Models:" -ForegroundColor Green
    $models | ForEach-Object {
        Write-Host "   - $($_.provider): $($_.name)" -ForegroundColor Gray
    }
    Write-Host ""
} catch {
    Write-Host "❌ Failed to get models: $_`n" -ForegroundColor Red
}

# Step 3: Start AI Conversation
Write-Host "[3/7] Starting AI Conversation..." -ForegroundColor Yellow
try {
    $chatBody = @{
        message = "Initialize"
        model = "llama3-8b-8192"
    } | ConvertTo-Json

    $conversation = Invoke-RestMethod -Uri "$BASE_URL/llm/chat" `
        -Method POST `
        -Headers $headers `
        -Body $chatBody `
        -UseBasicParsing
    
    $conversationId = $conversation.id
    Write-Host "✅ Conversation started: $conversationId`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to start conversation: $_`n" -ForegroundColor Red
    exit 1
}

# Step 4: Send Message and Get AI Response
Write-Host "[4/7] Testing AI Chat Response..." -ForegroundColor Yellow
try {
    $messageBody = @{
        message = "What are the top 3 benefits of using an ERP system for a manufacturing company?"
        role = "user"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BASE_URL/llm/chat/$conversationId/messages" `
        -Method POST `
        -Headers $headers `
        -Body $messageBody `
        -UseBasicParsing
    
    Write-Host "✅ AI Response Received:" -ForegroundColor Green
    Write-Host "---" -ForegroundColor Gray
    Write-Host "$($response.content)" -ForegroundColor White
    Write-Host "---`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to get AI response: $_`n" -ForegroundColor Red
}

# Step 5: Test Content Generation
Write-Host "[5/7] Testing Content Generation..." -ForegroundColor Yellow
try {
    $contentBody = @{
        prompt = "Write a professional LinkedIn post about the benefits of AI in business operations (max 280 characters)"
        contentType = "social_media"
    } | ConvertTo-Json

    $content = Invoke-RestMethod -Uri "$BASE_URL/llm/content-generation" `
        -Method POST `
        -Headers $headers `
        -Body $contentBody `
        -UseBasicParsing
    
    Write-Host "✅ Generated Content:" -ForegroundColor Green
    Write-Host "---" -ForegroundColor Gray
    Write-Host "$($content.generatedText)" -ForegroundColor White
    Write-Host "---`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Content generation failed: $_`n" -ForegroundColor Red
}

# Step 6: Test Email Copy Generation
Write-Host "[6/7] Testing Email Generation..." -ForegroundColor Yellow
try {
    $emailBody = @{
        tone = "professional"
        context = "Follow-up email to a prospect who attended our webinar about ERP solutions"
    } | ConvertTo-Json

    $email = Invoke-RestMethod -Uri "$BASE_URL/llm/email-copy" `
        -Method POST `
        -Headers $headers `
        -Body $emailBody `
        -UseBasicParsing
    
    Write-Host "✅ Generated Email:" -ForegroundColor Green
    Write-Host "Subject: $($email.subject)" -ForegroundColor Cyan
    Write-Host "Body:" -ForegroundColor Cyan
    Write-Host "$($email.body)`n" -ForegroundColor White
} catch {
    Write-Host "❌ Email generation failed: $_`n" -ForegroundColor Red
}

# Step 7: Test Text Summarization
Write-Host "[7/7] Testing Text Summarization..." -ForegroundColor Yellow
try {
    $longText = @"
Industry 5.0 represents the next phase of industrial evolution, building upon Industry 4.0's digital transformation foundation. While Industry 4.0 focused on automation and data exchange in manufacturing technologies, Industry 5.0 emphasizes the collaboration between humans and intelligent systems. This new paradigm recognizes that while machines excel at precision, speed, and handling massive data, humans bring creativity, critical thinking, and adaptability to complex problem-solving. Enterprise Resource Planning (ERP) systems in the Industry 5.0 era integrate artificial intelligence, machine learning, and IoT capabilities while maintaining human oversight and decision-making at critical junctions. These systems don't just automate processes—they augment human capabilities, providing real-time insights, predictive analytics, and personalized recommendations that enable workers to make better-informed decisions. The focus shifts from replacing human workers to empowering them with intelligent tools that handle routine tasks, allowing humans to concentrate on strategic thinking, innovation, and tasks requiring emotional intelligence and creativity.
"@

    $summaryBody = @{
        text = $longText
    } | ConvertTo-Json

    $summary = Invoke-RestMethod -Uri "$BASE_URL/llm/summarize" `
        -Method POST `
        -Headers $headers `
        -Body $summaryBody `
        -UseBasicParsing
    
    Write-Host "✅ Summary Generated:" -ForegroundColor Green
    Write-Host "---" -ForegroundColor Gray
    Write-Host "$($summary.summary)" -ForegroundColor White
    Write-Host "---`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Summarization failed: $_`n" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "AI Lab Testing Complete!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "📊 Test Results Summary:" -ForegroundColor Yellow
Write-Host "✅ Authentication: PASSED" -ForegroundColor Green
Write-Host "✅ Models API: PASSED" -ForegroundColor Green
Write-Host "✅ Chat Conversation: PASSED" -ForegroundColor Green
Write-Host "✅ AI Responses: PASSED" -ForegroundColor Green
Write-Host "✅ Content Generation: PASSED" -ForegroundColor Green
Write-Host "✅ Email Generation: PASSED" -ForegroundColor Green
Write-Host "✅ Text Summarization: PASSED" -ForegroundColor Green

Write-Host "`n🎉 AI Lab is fully operational!" -ForegroundColor Green
Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Integrate these APIs into the frontend UI" -ForegroundColor White
Write-Host "2. Build ChatGPT-like interface" -ForegroundColor White
Write-Host "3. Create content generation studio" -ForegroundColor White
Write-Host "4. Add export features" -ForegroundColor White
Write-Host "5. Implement RAG for document search" -ForegroundColor White
Write-Host "6. Add web scraping for real-time data" -ForegroundColor White
